import * as yup from "yup";

export const validationSchema = yup.object({
  username:yup
  .string()
  .min(3,"user name must be at least 3 characters")
  .required("user name must be required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password should be of minimum 8 characters length")
    .required("Password is required"),
});
