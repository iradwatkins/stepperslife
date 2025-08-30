import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 
              "bg-purple-600 hover:bg-purple-700 text-white",
            card: "shadow-xl",
          },
        }}
        afterSignInUrl="/"
        signUpUrl="/sign-up"
      />
    </div>
  );
}