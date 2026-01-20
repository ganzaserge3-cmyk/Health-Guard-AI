"use client";

import { useState, useRef, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';
import TestUpload from '@/components/TestUpload';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { 
  Send, 
  Image as ImageIcon, 
  Zap, 
  AlertCircle, 
  Stethoscope, 
  Pill, 
  Apple, 
  Brain, 
  Dumbbell,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
  Sparkles
} from 'lucide-react';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type: 'text' | 'image' | 'analysis';
  imageUrl?: string;
  isExpanded?: boolean;
};

// Use the NEXT_PUBLIC prefix for the API Key
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyBngS7cEiHRfKeBGZ7fif_M8I1Vm_4u0qU"
);

export default function HealthAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `**👋 Welcome to HealthGuard AI**\n\nI'm your AI health assistant powered by Google Gemini. I can help with symptoms, medications, and nutrition.\n\n**⚠️ Medical Disclaimer:** I provide health information for educational purposes only. Always consult healthcare professionals for medical advice.\n\n**How can I assist you today?**`,
      role: 'assistant',
      timestamp: new Date(),
      type: 'text',
      isExpanded: true
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [analysisMode, setAnalysisMode] = useState<'chat' | 'image'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // FIXED: Added Safety Settings to allow medical discussion
  const getAIResponse = async (userInput: string) => {
    try {
      // Use gemini-1.5-flash (faster and more stable for free tier)
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      });
      
      const prompt = `You are HealthGuard AI, a medical assistant. Provide clear info for: "${userInput}". Always include a disclaimer.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return cleanResponse(text);
      
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      return `**Temporary Issue**\nI couldn't process that request. Please ensure your API key is active in .env.local and try again.`;
    }
  };

  // FIXED: Updated to gemini-1.5-flash for image analysis
  const analyzeMedicalImage = async (imageFile: File, description: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const reader = new FileReader();
      return new Promise<string>((resolve) => {
        reader.onloadend = async () => {
          const base64String = reader.result?.toString().split(',')[1] || '';
          
          const result = await model.generateContent([
            `Analyze this medical image: "${description}". Provide general guidance and advise seeing a doctor.`,
            {
              inlineData: {
                data: base64String,
                mimeType: imageFile.type
              }
            }
          ]);
          
          const response = await result.response;
          resolve(cleanResponse(response.text()));
        };
        reader.readAsDataURL(imageFile);
      });
      
    } catch (error) {
      return `**Image Error**\nUnable to analyze this image.`;
    }
  };

  const cleanResponse = (text: string) => {
    return text.replace(/\*\*/g, '**').trim();
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !uploadedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input || 'Analyze this medical image',
      role: 'user',
      timestamp: new Date(),
      type: uploadedImage ? 'image' : 'text',
      imageUrl: imagePreview
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = uploadedImage 
        ? await analyzeMedicalImage(uploadedImage, input)
        : await getAIResponse(input);
        
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
        type: uploadedImage ? 'analysis' : 'text',
        isExpanded: true
      };
      
      setMessages(prev => [...prev, aiMessage]);
      if (uploadedImage) handleRemoveImage();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setAnalysisMode('image');
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview('');
    setAnalysisMode('chat');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMessageExpand = (id: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, isExpanded: !msg.isExpanded } : msg
    ));
  };

  const quickActions = [
    { icon: <Stethoscope size={16} />, text: 'What is Cancer?', question: 'What is cancer?' },
    { icon: <Pill size={16} />, text: 'Diabetes Info', question: 'What is diabetes?' },
    { icon: <Apple size={16} />, text: 'Healthy Diet', question: 'Healthy diet tips' },
  ];

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    return (
      <div key={message.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} mb-6`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600' : 'bg-green-600'}`}>
          {isUser ? <User size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
        </div>
        <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : ''}`}>
          <div className={`rounded-2xl px-5 py-4 ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 border'}`}>
            {message.type === 'image' && message.imageUrl && (
              <img src={message.imageUrl} alt="upload" className="w-full h-48 object-cover rounded-lg mb-2" />
            )}
            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-white">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <Sparkles /> HealthGuard AI
          </h1>
          <div className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">API CONNECTED</div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.map(renderMessage)}
          {isLoading && <div className="text-sm text-gray-500 animate-pulse">Gemini is thinking...</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex gap-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a health question..."
              className="flex-1 p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {quickActions.map((action, i) => (
              <button key={i} onClick={() => setInput(action.question)} className="text-xs bg-white border px-3 py-2 rounded-lg hover:bg-blue-50 transition">
                {action.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}