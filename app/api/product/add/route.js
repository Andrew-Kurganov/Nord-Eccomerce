import { v2 as cloudinary } from "cloudinary";
import { getAuth } from '@clerk/nextjs/server'
import authSeller from "@/lib/authSeller";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
    try {
        const { userId } = getAuth(request);

        // Проверка аутентификации пользователя
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "User not authenticated" },
                { status: 401 }
            );
        }

        // Проверка прав продавца
        const isSeller = await authSeller(userId);
        if (!isSeller) {
            return NextResponse.json(
                { success: false, message: "Not authorized" },
                { status: 403 }
            );
        }

        // Получение данных из формы
        const formData = await request.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const category = formData.get("category");
        const price = formData.get("price");
        const offerPrice = formData.get("offerPrice");
        const files = formData.getAll("images");

        // Проверка наличия файлов
        if (!files || files.length === 0) {
            return NextResponse.json(
                { success: false, message: "No files uploaded" },
                { status: 400 }
            );
        }

        // Загрузка изображений в Cloudinary
        const uploadPromises = files.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: "auto" },
                    (error, result) => (error ? reject(error) : resolve(result))
                );
                stream.end(buffer);
            });
        });

        const results = await Promise.all(uploadPromises);
        const images = results.map((result) => result.secure_url);

        // Создание товара в базе данных
        await connectDB();
        const newProduct = await Product.create({
            userId, // Используем userId из Clerk
            name,
            description,
            category,
            price: Number(price),
            offerPrice: Number(offerPrice),
            image: images,
            date: Date.now(),
        });

        return NextResponse.json(
            { success: true, message: "Product created", newProduct },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}