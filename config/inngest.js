import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/user";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "nordcart-next" });

//Inngest Function
export const syncUserCreation = inngest.createFunction(
  {
    id: "nordcart-next-update-user-from-clerk",
    name: "Sync user from Clerk"
  },
  { event: "clerk/user.created" }, // Правильный формат события
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      if (!id || !email_addresses?.[0]?.email_address) {
        throw new Error("Invalid user data");
      }

      // Формируем имя с проверкой на null/undefined
      const name = [first_name, last_name].filter(Boolean).join(" ").trim() || "Unnamed User";

      await connectDB();
      const newUser = await User.create({
        _id: id,
        email: email_addresses[0].email_address,
        name,
        imageUrl: image_url,
      });

      console.log("✅ User created:", newUser);
    } catch (error) {
      console.error("❌ Error syncing user:", error);
      throw error;
    }
  }
);

// Inngest Function
export const syncUserUpdation = inngest.createFunction(
  {
    id: 'update-user-from-clerk'
  },
  { event: 'clerk/user.updated' },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + '' + last_name,
      imageUrl: image_url
    }
    await connectDB()
    await User.findByIdAndUpdate(id, userData)
  }
)

//Inngest
export const syncUserDeletion = inngest.createFunction(
  {
    id: 'delete-user-with-clerk'
  },
  { event: 'clerk/user.deleted' },
  async ({ event }) => {

    const { id } = event.data

    await connectDB()
    await User.findByIdAndDelete(id)
  }
)