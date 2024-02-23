import React, { useRef, useState, useEffect } from 'react';
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import OpenAI from "openai";
import { FAQs } from './question'



function CodeSnippet({ code }) {
  return (
    <SyntaxHighlighter language="json" style={docco}>
      {code}
    </SyntaxHighlighter>
  );
}



function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatBottomRef = useRef(null);

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    messages.concat(messages)
    messages.push({ text: input, sender: 'user' });
    setInput('');

    callDialogflowAPI(input);
  };

  const callDialogflowAPI = async (message) => {
    const userResponse = input.toLocaleLowerCase();

    const botAns = FAQs.filter(ele => {
      return ele.question.toLocaleLowerCase().includes(userResponse.toLocaleLowerCase())
    });

    const openai = new OpenAI({ apiKey: '??????????', dangerouslyAllowBrowser: true });

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant designed to output JSON.",
        },
        { role: "user", content: userResponse },
      ],
      model: "gpt-3.5-turbo-0125"
    });

    const msg = completion.choices[0].message;

    // Determine the key containing the generated text
    let generatedText = null;

    // Loop through the keys of the message object
    for (const key in msg) {
      // Check if the value corresponding to the key is a string
      if (typeof msg[key] === 'string') {
        // Assume this is the generated text
        generatedText = msg[key];
        break;
      }
    }

    if (generatedText !== null) {
      console.log(msg)
      console.log("Generated text:", generatedText);
    } else {
      console.log("Generated text not found in response.");
    }

    // console.log({content: userResponse });
    // console.log(completion);
    // console.log(completion.choices[0].message.content)


    // if (botAns[0]?.answer) {
    //   setMessages([...messages, { text: botAns[0].answer, sender: 'bot' }]);
    // } else {
    //   setMessages([...messages, { text: "Sorry I didn't get you question!", sender: 'bot' }]);
    // }

    setMessages([...messages, { text: msg.content, sender: 'bot' }]);



    // console.log(answer);
    //   if (userResponse === 'hi') {
    //     setMessages([...messages, { text: `Hi Sir I am sourabh's assistant currently in testing mood!\nHow can I help you`, sender: 'bot' }]);
    //   } else if (input === 'may i know you name') {
    //     setMessages([...messages, { text: `Sure Sir. My Name is chhota bacha.`, sender: 'bot' }]);
    //   }
    //   else {
    //     setMessages([...messages, { text: 'Thanks you for using our service!', sender: 'bot' }]);
    //   }
  };

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);


  return (
    <div style={{ width: '50vh', position: 'absolute', bottom: '0', right: '0', boxShadow: '#787a7a5e 10px 10px 10px 10px', margin: '10px 10px', borderRadius: '8px' }} >
      <div style={{ height: '400px', overflowY: 'scroll' }}>
        {messages.map((message, index) => (
          <div key={index} style={{ textAlign: message.sender === 'user' ? 'right' : 'left', margin: '10px' }}>
            <div style={{ background: message.sender === 'user' ? '#007bff' : '#28a745', color: '#fff', padding: '8px', borderRadius: '5px' }}>
              {/* {message.text} */}
              {message.sender === 'user' ? message.text : <CodeSnippet code={message.text} />}
            </div>
          </div>
        ))}
        <div ref={chatBottomRef}></div>
      </div>
      <div style={{ marginLeft: '8px', marginTop: '20px', padding: '8px' }}>
        <input type="text" style={{ padding: '8px', width: '230px', marginRight: '4px' }} value={input} onChange={(e) => { setInput(e.target.value); }} />
        <button onClick={handleSendMessage} style={{ padding: '8px 12px', weight: '68px', fontSize: '14px', fontWeight: '900' }}>Send</button>
      </div>
    </div>
  );
}

export default App;

