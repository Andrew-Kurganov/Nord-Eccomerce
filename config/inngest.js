import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/user";

export const inngest = new Inngest({ 
  id: "nordcart-next",
  eventKey: process.env.INNGEST_EVENT_KEY 
});

// Объект со всеми функциями
const inngestFunctions = {
  syncUserCreation: inngest.createFunction(
    {
      id: 'sync-user-from-clerk',
      retries: 3
    },
    { event: 'clerk/user.created' },
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
      id: 'update-user-from-clerk',
      retries: 3
    },
    { event: 'clerk/user.updated' },
    async ({ event }) => {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      await connectDB();

      await User.findByIdAndUpdate(id, {
        email: email_addresses[0]?.email_address,
        name: `${first_name} ${last_name}`.trim(),
        imageUrl: image_url
      }, { new: true });
    }
  ),

  syncUserDeletion: inngest.createFunction(
    {
      id: 'delete-user-with-clerk',
      retries: 3
    },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
      const { id } = event.data;
      await connectDB();
      await User.findByIdAndDelete(id);
    }
  )
};

// Экспорт массива функций
export const functions = Object.values(inngestFunctions);