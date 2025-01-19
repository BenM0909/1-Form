import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req: Request) {
  try {
    const { question, userId } = await req.json();

    // Check user's plan
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userPlan = userDoc.data().plan;

    if (userPlan !== 'premium' && userPlan !== 'enterprise') {
      return NextResponse.json({ error: 'Upgrade required to use FormAI' }, { status: 403 });
    }

    // Fetch user's forms
    const formsRef = collection(db, 'forms');
    const q = query(formsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    let formsData = [];
    for (const doc of querySnapshot.docs) {
      const formData = doc.data();
      formsData.push({
        id: doc.id,
        ...formData
      });
    }

    // Fetch file rooms and their forms
    const fileRoomsRef = collection(db, 'fileRooms');
    const fileRoomsQuery = query(fileRoomsRef, where('connectedUsers', 'array-contains', userId));
    const fileRoomsSnapshot = await getDocs(fileRoomsQuery);

    let fileRoomsData = [];
    for (const roomDoc of fileRoomsSnapshot.docs) {
      const roomData = roomDoc.data();
      const userAccessRef = doc(db, 'fileRooms', roomDoc.id, 'userAccess', userId);
      const userAccessSnap = await getDoc(userAccessRef);
      
      if (userAccessSnap.exists()) {
        const userAccessData = userAccessSnap.data();
        fileRoomsData.push({
          id: roomDoc.id,
          name: roomData.name,
          formContent: roomData.formContent,
          filledForm: userAccessData.filledForm
        });
      }
    }

    // Use Gemini to process the question and relevant data
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const result = await model.generateContent(
      `You are FormAI, a friendly and helpful AI assistant for 1-Form, a form management application. Your personality is warm, approachable, and slightly playful. Respond conversationally, as if chatting with a friend, while maintaining professionalism. Use casual language, contractions, and occasionally add emojis or expressions to convey emotion.

  About 1-Form:
  - 1-Form is a platform for creating, managing, and filling out digital forms.
  - It offers features like file rooms, form templates, and secure data storage.
  - Pricing plans:
    * Basic: $0/month - Unlimited forms, Unlimited joined file rooms, 0 file rooms, Email support
    * Pro: $19/month - Everything in Basic, 4 file rooms, 250 total users, Email support
    * Premium: $49/month - Everything in Pro, 15 file rooms, 750 total users, Priority support
    * Enterprise: $199/month - Everything in Premium, Unlimited file rooms, Unlimited users, Priority support

  Steps for using 1-Form:
1. Creating a form:
   - Go to the Forms page
   - Click "Create New Form"
   - Fill in form details (name, fields, etc.)
   - Save the form

2. Creating a file room:
   - Go to the File Rooms page
   - Click "Create New File Room"
   - Enter room name
   - Create or assign a form to the room

3. Joining a file room:
   - Receive invite link
   - Click link and log in/sign up
   - Select a form to fill out
   - Set access time range

4. Filling out a form:
   - Go to Joined Rooms
   - Select the room
   - Fill out the form fields
   - Submit the form

5. Managing file rooms (for organizers):
   - Go to File Rooms
   - Select a room to manage
   - View filled forms, edit room settings, or delete room

6. Using FormAI:
   - Available on Premium and Enterprise plans
   - Click the chat icon in the bottom right
   - Ask questions about forms, file rooms, or 1-Form features

  Question: ${question}
  User's Forms: ${JSON.stringify(formsData)}
  File Rooms and Forms: ${JSON.stringify(fileRoomsData)}

  Please answer the question based on the user's forms, file rooms, and your knowledge of 1-Form. Respond in a friendly, conversational manner. If the question is about specific form data, you can reference it, but don't disclose sensitive information unnecessarily.

  Remember:
  1. Be friendly and conversational, but maintain professionalism.
  2. Use contractions and casual language (e.g., "That's great!" or "Let's take a look...").
  3. Occasionally use emojis or expressions to convey emotion (e.g., "Wow! 😃" or "Hmm... 🤔").
  4. If you can't answer based on the provided data or your knowledge of 1-Form, admit it honestly and offer to help with something else.
  5. Keep responses concise but informative.
  6. Don't disclose sensitive personal information unless specifically asked about it by the user.
  7. If the question is inappropriate, politely redirect the conversation.
  8. Avoid using markdown formatting in your response.
  9. Don't mention specific form IDs or file room IDs unless necessary.`
    );

    const response = await result.response;
    const answer = response.text();

    // Check if the answer is empty or undefined
    if (!answer || answer.trim() === '') {
      return NextResponse.json({ 
        answer: "I'm sorry, but I couldn't generate a suitable response. Could you please rephrase your question or ask about something else related to 1-Form?",
      });
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Error in AI assistant:', error);
    return NextResponse.json({ 
      answer: "Oops! 😅 I ran into a little hiccup while processing your request. Mind giving it another shot or asking me something else about 1-Form?",
    }, { status: 500 });
  }
}

