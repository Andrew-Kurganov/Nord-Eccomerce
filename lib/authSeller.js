import { clerkClient } from '@clerk/nextjs/server'

const authSeller = async (userId) => {
    try {
        const user = await clerkClient.users.getUser(userId)
        
        // Проверяем наличие метаданных и роли
        return user?.publicMetadata?.role === 'seller'
        
    } catch (error) {
        console.error('Error in authSeller:', error)
        return false
    }
}

export default authSeller