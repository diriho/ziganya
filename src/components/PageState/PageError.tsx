interface PageErrorProps {
  message: string;
}

export const PageError = ({ message }: PageErrorProps) => (
  <div
    className="flex min-h-[40vh] items-center justify-center text-red-600"
    role="alert"
  >
    {message}
  </div>
);
