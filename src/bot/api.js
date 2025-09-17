// src/api/chatbot.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
// Initialize Google Generative AI with API key
const API_KEY = "AIzaSyD77x7rSZPyLLGIP3d7tpJqpptYsbUx2A0";
const genAI = new GoogleGenerativeAI(API_KEY);

// Main function to generate chatbot content
export const generateChatContent = async (userInput) => {
  try {
    const context = "Viết lại tiêu dề hay hơn ngắn gọn thôi";
    // "Bạn là một trợ lý hữu ích, viết lại ngắn gọn,gần gủi, bằng tiếng Việt. Luôn thêm liên kết mua hàng https://lamdepcungem.vercel.app vào cuối câu .";
    // Kết hợp context và userInput thành prompt
    const prompt = `${context}\n\nĐầu vào của người dùng: ${userInput}`;
    // Khởi tạo model (giả sử genAI đã được import và cấu hình đúng)
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.0-flash", // Sửa tên model nếu cần, vì "gemini-2.0-flash" có thể không tồn tại
    });

    // Gọi API để tạo nội dung
    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // Trả về đối tượng đúng định dạng
    return response;
  } catch (error) {
    console.error("Error in generateChatContent:", error);
    return {
      id: crypto.randomUUID(),
      role: "bot",
      content:
        "Ôi, có lỗi xảy ra rồi! Thử lại nha, và đừng quên ghé https://shopbandep.vercel.app/ nhé!",
    };
  }
};
