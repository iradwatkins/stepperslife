import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ isAdmin: false, redirect: "/sign-in" });
    }
    
    const userEmail = user.emailAddresses?.[0]?.emailAddress;
    
    // Check if user is admin
    if (userEmail === "iradwalkins@gmail.com") {
      return NextResponse.json({ 
        isAdmin: true, 
        redirect: "/admin",
        user: {
          email: userEmail,
          name: user.firstName || "Admin"
        }
      });
    }
    
    // Check if user is organizer
    const isOrganizer = user.publicMetadata?.isOrganizer || 
                       user.publicMetadata?.isSeller;
    
    if (isOrganizer) {
      return NextResponse.json({ 
        isAdmin: false,
        isOrganizer: true,
        redirect: "/organizer",
        user: {
          email: userEmail,
          name: user.firstName || "Organizer"
        }
      });
    }
    
    // Regular user
    return NextResponse.json({ 
      isAdmin: false,
      isOrganizer: false,
      redirect: "/profile",
      user: {
        email: userEmail,
        name: user.firstName || "User"
      }
    });
    
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json({ 
      isAdmin: false, 
      redirect: "/profile",
      error: "Failed to check admin status"
    });
  }
}