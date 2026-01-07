import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Alert, Typography } from "@material-tailwind/react";

export function ErrorAlert({ message, onClose, className = "" }) {
  if (!message) return null;

  return (
    <Alert
      color="red"
      variant="gradient"
      icon={<ExclamationTriangleIcon className="h-6 w-6" />}
      className={`fixed top-4 right-4 z-50 max-w-md shadow-lg ${className}`}
      action={
        <button
          onClick={onClose}
          className="!absolute top-3 right-3 text-white hover:opacity-80"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      }
    >
      <Typography variant="small" className="font-medium text-white">
        {message}
      </Typography>
    </Alert>
  );
}

export function SuccessAlert({ message, onClose, className = "" }) {
  if (!message) return null;

  return (
    <Alert
      color="green"
      variant="gradient"
      className={`fixed top-4 right-4 z-50 max-w-md shadow-lg ${className}`}
      action={
        <button
          onClick={onClose}
          className="!absolute top-3 right-3 text-white hover:opacity-80"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      }
    >
      <Typography variant="small" className="font-medium text-white">
        {message}
      </Typography>
    </Alert>
  );
}

export default ErrorAlert;
