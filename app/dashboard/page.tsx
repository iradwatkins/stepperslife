import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-12 max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          SteppersLife Dashboard
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Welcome, {session.user.name || session.user.email}!
        </p>
        <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4 mb-6">
          <p className="text-lg text-green-700 font-semibold">
            ✅ SSO Login Successful
          </p>
          <p className="text-sm text-green-600 mt-2">
            Main Site: stepperslife.com (Port 3001)
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Try visiting magazine, events, stores, classes, restaurants, or services subdomains!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <a
            href="https://magazine.stepperslife.com"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            Magazine →
          </a>
          <a
            href="https://events.stepperslife.com"
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            Events →
          </a>
          <a
            href="https://stores.stepperslife.com"
            className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            Stores →
          </a>
          <a
            href="https://classes.stepperslife.com"
            className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            Classes →
          </a>
          <a
            href="https://restaurants.stepperslife.com"
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            Restaurants →
          </a>
          <a
            href="https://services.stepperslife.com"
            className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            Services →
          </a>
        </div>

        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 text-lg font-semibold"
          >
            Sign Out
          </button>
        </form>
      </div>
    </main>
  )
}
