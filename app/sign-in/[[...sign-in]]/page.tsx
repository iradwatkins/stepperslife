import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white dark:bg-gray-800 shadow-xl",
          }
        }}
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        afterSignInUrl="/seller/new-event"
      />
    </div>
  );
}