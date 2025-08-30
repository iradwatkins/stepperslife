import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: 
              "bg-purple-600 hover:bg-purple-700 text-white",
            card: "shadow-xl",
          },
        }}
        afterSignUpUrl="/"
        signInUrl="/sign-in"
      />
    </div>
  );
}