import * as admin from "firebase-admin";

admin.initializeApp();

export { onStudentCreated } from "./triggers/onStudentCreated";
export { onBusinessCreated } from "./triggers/onBusinessCreated";
