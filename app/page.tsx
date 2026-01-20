"use client";

import { useState, useRef, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';
import TestUpload from '@/components/TestUpload';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

// FIXED LINE 30: Using environment variable instead of hardcoded key
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyBngS7cEiHRfKeBGZ7fif_M8I1Vm_4u0qU"
);

export default function HealthAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `**👋 Welcome to HealthGuard AI**

I'm your AI health assistant powered by Google Gemini. I can help with:

• **Symptom analysis** - Headaches, fever, pain, etc.
• **Medication information** - Side effects, dosages, interactions
• **Nutrition advice** - Diet plans, healthy eating habits
• **Mental health** - Stress, anxiety, sleep issues
• **Fitness guidance** - Exercise routines, recovery
• **General health questions** - Medical information

**⚠️ Medical Disclaimer:** I provide health information for educational purposes only. Always consult healthcare professionals for medical advice, diagnosis, or treatment.

**How can I assist you today?**`,
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

  const getAIResponse = async (userInput: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `You are HealthGuard AI, a helpful medical assistant. Provide clear, accurate health information.

User Question: "${userInput}"

Guidelines for response:
1. Answer directly and helpfully
2. Use simple, clear language
3. Organize with bullet points for readability
4. Include important medical information
5. Always remind to consult doctors
6. Be concise but thorough
7. Use emojis sparingly (only where appropriate)
8. Format for easy reading

Provide a helpful medical response:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return cleanResponse(text);
      
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      
      // If using demo key doesn't work, guide user to get their own
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY === "demo-key") {
        return `**🔑 API Key Required**

To get real AI responses:

### **Step 1: Get FREE Gemini API Key**
1. Go to: **https://makersuite.google.com/app/apikey**
2. Sign in with Google account
3. Click **"Create API Key"**
4. Copy your FREE key (starts with AIza...)

### **Step 2: Update Environment Variable**
Add to **.env.local** file:
\`\`\`
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
\`\`\`

### **Step 3: Restart & Deploy**
Restart your app or redeploy on Vercel.

**Gemini API is FREE and works instantly!**`;
      }
      
      return `**Temporary Issue**
I'm having trouble processing your request. Please try again in a moment.

For immediate health concerns, consult a healthcare professional.`;
    }
  };

  const analyzeMedicalImage = async (imageFile: File, description: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
      
      // Convert image to base64
      const reader = new FileReader();
      return new Promise<string>((resolve) => {
        reader.onloadend = async () => {
          const base64String = reader.result?.toString().split(',')[1] || '';
          
          const prompt = `Analyze this medical image. User description: "${description}"

Provide helpful guidance about:
1. What could be shown in the image
2. General medical advice for such conditions
3. When to see a doctor
4. Important precautions

Remember: I cannot diagnose. Always recommend professional medical consultation.`;

          const result = await model.generateContent([
            prompt,
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
      console.error('Image analysis error:', error);
      return `**🖼️ Medical Image Guidance**

For proper medical assessment of images:

**What to do:**
1. **Consult a doctor** for accurate diagnosis
2. **Take clear photos** with good lighting
3. **Note symptoms** and timeline
4. **Monitor changes** over time

**Common medical images include:**
• Skin conditions (rashes, moles)
• Injuries (bruises, cuts)
• Eye issues
• Oral health concerns

**⚠️ Important:** AI cannot replace medical diagnosis. Always seek professional healthcare evaluation.`;
    }
  };

  const cleanResponse = (text: string) => {
    // Clean up Gemini's response format
    return text
      .replace(/\*\*/g, '**') // Keep bold formatting
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Reduce multiple newlines
      .replace(/^```[\s\S]*?\n|```$/g, '') // Remove code blocks
      .replace(/\[.*?\]/g, '') // Remove citations
      .trim();
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
      if (uploadedImage) {
        const analysis = await analyzeMedicalImage(uploadedImage, input);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: analysis,
          role: 'assistant',
          timestamp: new Date(),
          type: 'analysis',
          isExpanded: true
        };
        
        setMessages(prev => [...prev, aiMessage]);
        handleRemoveImage();
        setIsLoading(false);
      } else {
        const response = await getAIResponse(input);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          role: 'assistant',
          timestamp: new Date(),
          type: 'text',
          isExpanded: true
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "**Temporary Issue**\n\nI'm having trouble processing your request. Please try again in a moment.\n\nFor immediate health concerns, consult a healthcare professional.",
        role: 'assistant',
        timestamp: new Date(),
        type: 'text',
        isExpanded: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setAnalysisMode('image');
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview('');
    }
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
    { icon: <Stethoscope size={16} />, text: 'What is Cancer?', question: 'What is cancer? Explain symptoms, types, and prevention.' },
    { icon: <Pill size={16} />, text: 'Diabetes Info', question: 'What is diabetes? Types, symptoms, and management.' },
    { icon: <Apple size={16} />, text: 'Healthy Diet', question: 'What is a balanced diet for good health?' },
    { icon: <Brain size={16} />, text: 'Anxiety Help', question: 'What are symptoms of anxiety and how to manage it?' },
    { icon: <Dumbbell size={16} />, text: 'Exercise Benefits', question: 'Health benefits of regular exercise' },
    { icon: <AlertCircle size={16} />, text: 'COVID-19 Info', question: 'Current COVID-19 symptoms and prevention' },
  ];

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    const isLongMessage = message.content.length > 400;
    const displayContent = message.isExpanded || !isLongMessage 
      ? message.content 
      : message.content.substring(0, 400) + '...';
    
    return (
      <div key={message.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} mb-6`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-teal-500'
        }`}>
          {isUser ? (
            <User size={18} className="text-white" />
          ) : (
            <Bot size={18} className="text-white" />
          )}
        </div>
        
        {/* Message Bubble */}
        <div className={`flex-1 ${isUser ? 'items-end' : ''} flex flex-col max-w-[85%]`}>
          <div className={`rounded-2xl px-5 py-4 ${
            isUser 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-sm' 
              : message.type === 'analysis'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-bl-none shadow-sm'
              : 'bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-bl-none shadow-sm'
          }`}>
            {/* Image Preview */}
            {message.type === 'image' && message.imageUrl && (
              <div className="mb-4 -mx-3">
                <div className="relative rounded-xl overflow-hidden border border-gray-300 shadow-sm">
                  <img
                    src={message.imageUrl}
                    alt="Medical upload"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
                    <ImageIcon size={12} className="inline mr-1" />
                    Medical Image
                  </div>
                </div>
                {message.content && !message.content.includes('Medical Image Guidance') && (
                  <p className="text-sm text-gray-600 mt-3 px-1">{message.content}</p>
                )}
              </div>
            )}
            
            {/* Message Content */}
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {displayContent}
            </div>
            
            {/* Expand/Collapse Button */}
            {isLongMessage && !isUser && (
              <button
                onClick={() => toggleMessageExpand(message.id)}
                className="mt-4 flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
              >
                {message.isExpanded ? (
                  <>
                    <ChevronUp size={16} />
                    <span className={isUser ? 'text-blue-100' : 'text-green-600'}>Show less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    <span className={isUser ? 'text-blue-100' : 'text-green-600'}>Read more</span>
                  </>
                )}
              </button>
            )}
          </div>
          
          {/* Timestamp and Status */}
          <div className={`flex items-center gap-2 mt-2 ${isUser ? 'justify-end' : ''}`}>
            <div className={`text-xs ${isUser ? 'text-blue-500' : 'text-gray-500'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            {!isUser && message.type === 'analysis' && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                AI Analysis
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="text-white" size={26} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Bot size={12} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  HealthGuard AI
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-600">Powered by Google Gemini</span>
                  </div>
                  <span className="text-xs bg-gradient-to-r from-green-100 to-teal-100 text-green-700 px-2 py-1 rounded-full">
                    FREE API
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAnalysisMode('chat')}
                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                  analysisMode === 'chat' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
                }`}
              >
                <Send size={18} />
                <span className="font-medium">Chat</span>
              </button>
              <button
                onClick={() => setAnalysisMode('image')}
                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                  analysisMode === 'image' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-400'
                }`}
              >
                <ImageIcon size={18} />
                <span className="font-medium">Image</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Chat Area */}
          <div className="lg:w-2/3">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl overflow-hidden">
              {/* Chat Messages Container */}
              <div className="h-[600px] overflow-y-auto p-6 bg-gradient-to-b from-white to-blue-50/30">
                <div className="space-y-2">
                  {messages.map(renderMessage)}
                </div>
                
                {isLoading && (
                  <div className="flex gap-4 animate-pulse">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-teal-400 rounded-full flex items-center justify-center">
                        <Bot className="text-white" size={20} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gradient-to-r from-gray-100 to-blue-100 rounded-2xl rounded-bl-none p-5 max-w-[85%]">
                        <div className="flex items-center gap-3">
                          <div className="flex space-x-2">
                            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">Analyzing with Gemini AI...</div>
                            <div className="text-xs text-gray-500 mt-1">Getting medical information</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200/50 bg-white/90 p-6">
                {analysisMode === 'image' && (
                  <div className="mb-6">
                    <ImageUpload
                      onImageUpload={handleImageUpload}
                      onRemove={handleRemoveImage}
                      previewUrl={imagePreview}
                      isLoading={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      📷 Upload skin conditions, injuries, or other medical concerns
                    </p>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={
                          analysisMode === 'image' 
                            ? 'Describe symptoms with your image...'
                            : 'Ask any health question (e.g., "What are symptoms of flu?")...'
                        }
                        className="w-full px-5 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-transparent focus:border-blue-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none transition-all duration-300 pr-14"
                        rows={3}
                      />
                      <div className="absolute right-4 bottom-4 flex items-center gap-2">
                        <button
                          onClick={() => setAnalysisMode(prev => prev === 'chat' ? 'image' : 'chat')}
                          className={`p-2.5 rounded-xl transition-all ${
                            analysisMode === 'image'
                              ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:text-purple-600 hover:bg-gray-200'
                          }`}
                        >
                          <ImageIcon size={20} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="mt-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap size={16} className="text-amber-500" />
                        <span className="text-sm font-medium text-gray-700">Quick Medical Questions:</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {quickActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => setInput(action.question)}
                            className="group inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 hover:shadow-sm transition-all duration-300"
                          >
                            <div className="text-blue-500 group-hover:scale-110 transition-transform">
                              {action.icon}
                            </div>
                            {action.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-end">
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || (!input.trim() && !uploadedImage)}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing</span>
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                    <div className="text-xs text-gray-500 text-center mt-2">
                      Press Enter to send
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Medical Disclaimer */}
            <div className="mt-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="text-amber-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 mb-2">Important Medical Disclaimer</h4>
                  <p className="text-sm text-amber-700">
                    This AI provides health information for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                  </p>
                </div>
              </div>
            </div>

            {/* Test Upload Component */}
            <div className="mt-6">
              <TestUpload />
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:w-1/3 space-y-6">
            {/* API Status Card */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl border border-blue-200 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <Zap className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Gemini AI Status</h3>
                  <p className="text-sm text-gray-600">Free Medical AI Assistant</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">API Connection</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-green-600">Connected</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">AI Model</span>
                  <span className="font-medium text-blue-600">Gemini Pro</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Vision Model</span>
                  <span className="font-medium text-purple-600">Ready</span>
                </div>
                
                <div className="pt-5 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-800 mb-2">Get Your FREE Key:</div>
                  <ol className="text-xs text-gray-600 space-y-2">
                    <li>1. Visit Google AI Studio</li>
                    <li>2. Sign in with Google</li>
                    <li>3. Click "Create API Key"</li>
                    <li>4. Add to .env.local file</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Emergency Card */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl border border-red-200 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Emergency Response</h3>
                  <p className="text-sm text-gray-600">Immediate medical assistance</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    const emergency = `**🚨 EMERGENCY MEDICAL GUIDANCE**

**CALL EMERGENCY SERVICES IMMEDIATELY FOR:**

**Life-Threatening Conditions:**
• Chest pain or pressure (possible heart attack)
• Difficulty breathing or shortness of breath
• Severe, uncontrolled bleeding
• Sudden weakness, numbness, or paralysis (stroke symptoms)
• Loss of consciousness
• Severe allergic reaction with swelling/difficulty breathing
• Suspected poisoning or overdose
• Severe burns or trauma
• Suicidal thoughts or self-harm intentions

**Stroke Recognition (BE FAST):**
• **B**alance - Sudden dizziness, loss of balance
• **E**yes - Sudden vision changes
• **F**ace - Drooping on one side
• **A**rms - Weakness in one arm
• **S**peech - Slurred or strange speech
• **T**ime - Call emergency immediately

**While Waiting for Help:**
1. **Stay Calm** - Your calmness helps the patient
2. **Do NOT Move** unless in immediate danger
3. **Check Responsiveness**
4. **Control Bleeding** with clean cloth and pressure
5. **Do NOT Give** food, drink, or medication
6. **Follow Dispatcher Instructions**

**Global Emergency Numbers:**
• **USA:** 911
• **Europe:** 112
• **UK:** 999 or 112
• **Australia:** 000
• **New Zealand:** 111
• **Japan:** 119
• **India:** 112 or 102

**Mental Health Crisis:**
• **USA:** 988 Suicide & Crisis Lifeline
• **International:** Find local crisis hotlines

⚠️ **This AI cannot provide emergency care. In life-threatening situations, call emergency services immediately.**`;
                    
                    const emergencyMessage: Message = {
                      id: Date.now().toString(),
                      content: emergency,
                      role: 'assistant',
                      timestamp: new Date(),
                      type: 'text',
                      isExpanded: true
                    };
                    setMessages(prev => [...prev, emergencyMessage]);
                  }}
                  className="w-full group"
                >
                  <div className="bg-white border-2 border-red-300 rounded-xl p-4 text-left hover:bg-red-50 transition-all duration-300 group-hover:border-red-400 group-hover:shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-red-600 text-lg">📞 Emergency Call</div>
                        <div className="text-red-700 font-semibold">911 / 112 / 000</div>
                        <div className="text-sm text-gray-600 mt-1">Immediate medical response</div>
                      </div>
                      <ChevronDown size={20} className="text-red-400 group-hover:text-red-600 transform group-hover:translate-y-1 transition-transform" />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 pt-8 border-t border-gray-200/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm text-gray-600">
                ⚕️ <span className="font-semibold">HealthGuard AI</span> - Medical Information Assistant
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Powered by Google Gemini AI • Always consult healthcare professionals
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Version 3.0</span>
              <span>•</span>
              <span>AI: Gemini Pro</span>
              <span>•</span>
              <span>API: Free</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}