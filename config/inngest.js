// config/inngest.js
import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/user";

// 1. Создаем единый клиент
const inngestClient = new Inngest({
  id: "nordcart-next",
  name: "Nordcart Next.js App"
});

// 2. Объявляем все функции в одном месте
const appFunctions = {
  syncUserCreation: inngestClient.createFunction(
    {
      id: "sync-user-from-clerk",
      name: "Sync Clerk User Creation"
    },
    { event: "clerk/user.created" },
    async ({ event }) => {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      await connectDB();
      await User.create({
        _id: id,
        email: email_addresses[0]?.email_address,
        name: `${first_name} ${last_name}`.trim(),
        imageUrl: image_url
      });
    }
  ),
  syncUserUpdation: inngestClient.createFunction(
    {
      id: "update-user-from-clerk",
      name: "Sync Clerk User Updates"
    },
    { event: "clerk/user.updated" },
    async ({ event }) => {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      await connectDB();
      await User.findByIdAndUpdate(
        id,
        {
          email: email_addresses[0]?.email_address,
          name: `${first_name} ${last_name}`.trim(),
          imageUrl: image_url
        },
        { new: true }
      );
    }
  ),
  syncUserDeletion: inngestClient.createFunction(
    {
      id: "delete-user-with-clerk",
      name: "Delete Clerk User"
    },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
      const { id } = event.data;
      await connectDB();
      await User.findByIdAndDelete(id);
    }
  )
};

// 3. Экспортируем как именованный массив
export const inngest = inngestClient;
export const functions = Object.values(appFunctions);