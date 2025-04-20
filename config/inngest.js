import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/user";

// Инициализация клиента Inngest
export const inngest = new Inngest({
  id: "nordcart-next",
  name: "Nordcart Next.js Application",
  eventKey: process.env.INNGEST_EVENT_KEY
});

// Основные функции приложения
const appFunctions = {
  syncUserCreation: inngest.createFunction(
    {
      id: "sync-user-from-clerk",
      name: "Sync User Creation",
      retries: 3
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
  
  syncUserUpdation: inngest.createFunction(
    {
      id: "update-user-from-clerk",
      name: "Sync User Updates",
      retries: 3
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
        { new: true, runValidators: true }
      );
    }
  ),

  syncUserDeletion: inngest.createFunction(
    {
      id: "delete-user-with-clerk",
      name: "Delete User",
      retries: 3
    },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
      const { id } = event.data;
      
      await connectDB();
      await User.findByIdAndDelete(id);
    }
  )
};

// Экспорт функций как массива
export const inngestFunctions = Object.values(appFunctions);