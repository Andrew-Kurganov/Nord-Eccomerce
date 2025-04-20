import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/user";

// Клиент без ID (используем только name)
export const inngest = new Inngest({
  name: "Nordcart",
  eventKey: process.env.INNGEST_EVENT_KEY
});

// Явные ID функций с контролем ошибок
const functions = [
  inngest.createFunction(
    {
      id: "sync-user-creation",
      name: "Sync User from Clerk (Create)",
      retries: 3,
      retry: {
        attempts: 5,
        period: "1m"
      }
    },
    { event: "clerk/user.created" },
    async ({ event }) => {
      try {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
        
        // Валидация данных
        if (!email_addresses?.[0]?.email_address) {
          throw new Error("Invalid email address");
        }

        await connectDB();
        
        await User.create({
          _id: id,
          email: email_addresses[0].email_address,
          name: [first_name, last_name].filter(Boolean).join(" "),
          imageUrl: image_url
        });

      } catch (error) {
        console.error("User creation failed:", error);
        throw error;
      }
    }
  ),

  inngest.createFunction(
    {
      id: "sync-user-updation",
      name: "Sync User from Clerk (Update)",
      retries: 3
    },
    { event: "clerk/user.updated" },
    async ({ event }) => {
      try {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;

        await connectDB();

        await User.findByIdAndUpdate(
          id,
          {
            email: email_addresses[0]?.email_address,
            name: [first_name, last_name].filter(Boolean).join(" "),
            imageUrl: image_url
          },
          { 
            new: true,
            runValidators: true 
          }
        );

      } catch (error) {
        console.error("User update failed:", error);
        throw error;
      }
    }
  ),

  inngest.createFunction(
    {
      id: "sync-user-deletion",
      name: "Delete User via Clerk",
      retries: 3
    },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
      try {
        const { id } = event.data;
        
        await connectDB();
        const result = await User.findByIdAndDelete(id);
        
        if (!result) {
          throw new Error(`User ${id} not found`);
        }

      } catch (error) {
        console.error("User deletion failed:", error);
        throw error;
      }
    }
  )
];

// Экспорт для дебаггинга
console.log("Registered Inngest functions:", functions.map(f => f.config.id));

export default functions;