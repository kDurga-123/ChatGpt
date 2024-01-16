import React, { useState, useEffect } from 'react';
import './main.css';
import { pdfjs } from 'react-pdf';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileUploader = ({ onFileChange, onDrop, onFileSelect }) => {
  const [storedFileNames, setStoredFileNames] = useState([]);

  const handleFileChange = (event) => {
    const newFiles = event.target.files;
    onFileChange([...Array.from(newFiles)]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const newFiles = event.dataTransfer.files;
    onDrop([...Array.from(newFiles)]);
  };

  const handleFileSelect = async (file) => {
    let content = '';

    try {
      if (file.type === 'application/pdf') {
        const pdfData = await fetch(URL.createObjectURL(file)).then((res) => res.arrayBuffer());
        const pdfDataTypedArray = new Uint8Array(pdfData);

        const pdfDoc = await pdfjs.getDocument({ data: pdfDataTypedArray }).promise;
        const numPages = pdfDoc.numPages;

        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();

          textContent.items.forEach((textItem) => {
            content += textItem.str + ' ';
          });
        }
      } else {
        content = await file.text();
      }
    } catch (error) {
      console.error(`Error reading file content: ${file.name}`, error);
    }

    onFileSelect({ name: file.name, content });
  };

  return (
    <div className="mixed-support">
      <div className="file-drop-area" onDragOver={handleDragOver} onDrop={handleDrop}>
        <p>Drag and drop files here</p>
        <p>or</p>
      </div>
      <label htmlFor="fileInput" className="custom-files-label">
        <span className="browse-link">browse</span>
      </label>
      <div className="file-input-area">
        <input id="fileInput" type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
      </div>

      {storedFileNames.length > 0 && (
        <div>
          <h2>Selected Files</h2>
          {storedFileNames.map((fileName, index) => (
            <div key={index}>
              <button onClick={() => onFileSelect({ name: fileName, content: '' })}>
                {fileName || 'Unnamed File'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TextExtractor = ({ selectedFile, fileData }) => {
  const conversationHistory = fileData[selectedFile?.name]?.conversation || [];
  const pairs = [];

  for (let i = 0; i < conversationHistory.length; i += 2) {
    const question = conversationHistory[i]?.content || '';
    const answer = conversationHistory[i + 1]?.content || '';
    pairs.push({ question, answer });
  }

  useEffect(() => {
    const scrollContainer = document.getElementById('scrollable-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [conversationHistory]);

  return (
    <div className="text-extractor-container">
      <div>
        {selectedFile?.name && (
          <div>
            {pairs.length > 0 && (
              <div id="scrollable-container" className="scrollable-container">
                {pairs.map((pair, index) => (
                  <div key={index}>
                    {pair.question && <div className="question">{pair.question}</div>}
                    {pair.answer && <div id="answer">{pair.answer}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState({ name: '', content: '' });
  const [question, setQuestion] = useState('');
  const [fileData, setFileData] = useState({});
  const [storedFileNames, setStoredFileNames] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [assistantReply, setAssistantReply] = useState('');
  const [visibleFiles, setVisibleFiles] = useState(files.length);
  const [status, setStatus] = useState('');
  const [response, setResponse] = useState('');
  

  const { transcript, resetTranscript, listening } = useSpeechRecognition({
    onEnd: () => {
      handleProcess(files);
    },
  });

  useEffect(() => {
    const storedFileData = JSON.parse(localStorage.getItem('fileData')) || {};
    setFileData(storedFileData);
  }, []);

  useEffect(() => {
    const storedFileNames = JSON.parse(localStorage.getItem('storedFileNames')) || [];
    setStoredFileNames(storedFileNames);
  }, []);

  const saveFileNamesToLocalStorage = (fileNames) => {
    localStorage.setItem('storedFileNames', JSON.stringify(fileNames));
  };

  const handleFileChange = (files) => {
    setFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
  };

  const handleDrop = (files) => {
    setFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
  };



  const handleProcess = async (files) => {
    setProcessing(true);
    const API_KEY = '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';
    const MAX_RETRIES = 3;
    let retryCount = 0;
  
    try {
      // Stop listening before processing
      SpeechRecognition.stopListening();
  
      const textData = await getTextFromFiles(files);
  
      const apiRequestBody = {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: question }, // Include the user's question in the messages
          { role: 'assistant', content: textData.slice(0, 4096) }, // Limit to 4096 characters
        ],
      };
  
      let response;
  
      do {
        try {
          response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: 'Bearer ' + API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiRequestBody),
          });
  
          if (!response.ok) {
            throw new Error(`Failed to send data to Bard API. Status: ${response.status}`);
          }
  
          // Process the response as needed
          const data = await response.json();
          console.log('Data received from Bard API:', data);
  
          // Set the assistant's reply content to display in the UI
          const assistantReplyContent = data.choices?.[0]?.message?.content.replace(/\n/g, ' ');
  
          setAssistantReply(assistantReplyContent);
  
          // Update the conversation history with the new message
          const updatedConversation = [
            ...fileData[selectedFile?.name]?.conversation || [],
            { role: 'user', content: question },
            { role: 'assistant', content: assistantReplyContent },
          ];
  
          const updatedFileData = {
            ...fileData,
            [selectedFile?.name]: {
              ...fileData[selectedFile?.name],
              conversation: updatedConversation,
            },
          };
  
          setFileData(updatedFileData);
          // Set status and response here
          setStatus(data.status);
          setResponse(JSON.stringify(data, null, 2));
  
          // Save the updated file data to local storage
          localStorage.setItem('fileData', JSON.stringify(updatedFileData));
        } catch (error) {
          console.error('Error processing and sending data:', error);
  
          if (response && response.status === 429 && retryCount < MAX_RETRIES) {
            // Retry after a delay
            retryCount++;
            // eslint-disable-next-line no-loop-func
            await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
          } else {
            throw error; // If the error is not a 429 or max retries are reached, throw the error
          }
        }
      } while (response && response.status === 429 && retryCount < MAX_RETRIES);
    } finally {
      setProcessing(false);
      setQuestion('');
    }
  };
  
  const postDataToServer = async (fileName, jsonData, question, answer) => {
    try {
      console.log('fileName:', fileName);
      console.log('jsonData:', jsonData);
      console.log('question:', question);
      console.log('answer:', answer);
      const response = await fetch('http://localhost:8080/agentData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FileName: fileName,
          JsonData: jsonData,
          Question: question,
          Answer: answer,
        }),
      });
      console.log('Data to be posted:', { fileName, jsonData, question, answer });

      if (!response.ok) {
        throw new Error(`Failed to post data. Status: ${response.status}`);
      }
  
      // You can handle the response here if needed
      localStorage.setItem('storedFileName', fileName);
    localStorage.setItem('storedJsonData', jsonData);
    localStorage.setItem('storedQuestion', question);
    localStorage.setItem('storedAnswer', answer);
    const storedFileName = localStorage.getItem('storedFileName',fileName);
    const storedJsonData = localStorage.getItem('storedJsonData',jsonData);
    const storedQuestion = localStorage.getItem('storedQuestion',question);
    const storedAnswer = localStorage.getItem('storedAnswer',answer);
    
    // Check if the data exists in local storage
    if (storedFileName && storedJsonData && storedQuestion && storedAnswer) {
      // Use the retrieved data as needed
      console.log('Retrieved Data:', { storedFileName, storedJsonData, storedQuestion, storedAnswer });
    } else {
      console.log('Data not found in local storage');
    }

    } catch (error) {
      console.error('Error posting data:', error);
    }
  };

  useEffect(() => {
  const storedFileData = JSON.parse(localStorage.getItem('fileData')) || {};
  setFileData(storedFileData);
}, []);
  useEffect(() => {
    const storedFileNames = JSON.parse(localStorage.getItem('storedFileNames')) || [];
    setStoredFileNames(storedFileNames);
  
    // Retrieve data from local storage based on stored file names
    storedFileNames.forEach((fileName) => {
      const storedFileName = localStorage.getItem('storedFileName', fileName);
      const storedJsonData = localStorage.getItem('storedJsonData', fileName);
      const storedQuestion = localStorage.getItem('storedQuestion', fileName);
      const storedAnswer = localStorage.getItem('storedAnswer', fileName);
  
      // Check if the data exists in local storage
      if (storedFileName && storedJsonData && storedQuestion && storedAnswer) {
        // Use the retrieved data as needed
        console.log('Retrieved Data:', { storedFileName, storedJsonData, storedQuestion, storedAnswer });
      } else {
        console.log('Data not found in local storage for file:', fileName);
      }
    });
  }, []); 


  const getTextFromFiles = async (files) => {
    let combinedText = '';

    for (const file of files) {
      try {
        if (file.type === 'application/pdf') {
          // Handle PDF files
          const pdfData = await fetch(URL.createObjectURL(file)).then((res) => res.arrayBuffer());
          const pdfDataTypedArray = new Uint8Array(pdfData);

          const pdfDoc = await pdfjs.getDocument({ data: pdfDataTypedArray }).promise;
          const numPages = pdfDoc.numPages;

          for (let i = 1; i <= numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();

            // eslint-disable-next-line no-loop-func
            textContent.items.forEach((textItem) => {
              combinedText += textItem.str + ' ';
            });
          }
        } else {
          // Handle other file types (e.g., plain text)
          const textContent = await file.text();
          combinedText += textContent + ' ';
        }
      } catch (error) {
        console.error(`Error reading file: ${file.name}`, error);
      }
    }

    return combinedText.trim();
  };

  const handleAskQuestion = async () => {
    setProcessing(true);
  
    if (transcript.trim() !== '') {
      setQuestion(transcript.trim());
    } else if (question.trim() === '') {
      setProcessing(false);
      return;
    }
  
    const specificAnswer = getSpecificAnswer(question, fileData[selectedFile?.name]?.content);
  
    if (specificAnswer) {
      setAssistantReply(specificAnswer);
      setProcessing(false);
      setQuestion('');
      return; // Exit early if a specific answer is available
    }
  
    await new Promise((resolve) => setTimeout(resolve, 0));
    await postDataToServer(selectedFile.name, selectedFile.content, question, assistantReply);
  
    try {
      await handleProcess(files);
      resetTranscript();
    } catch (error) {
      console.error('Error processing question:', error);
    }
  
    setProcessing(false);
    setQuestion('');
  };
  
  const getSpecificAnswer = (userQuestion, fileContent) => {
    if (!fileContent) {
      return null;
    }
  
    // Implement your logic to analyze the file content and generate a specific answer
    const lowercasedContent = fileContent.toLowerCase();
    const lowercasedQuestion = userQuestion.toLowerCase();
  
    if (lowercasedContent.includes('specific keyword') && lowercasedQuestion.includes('related question')) {
      return 'The answer to your specific question about the keyword is...';
    }
  
    // Add more conditions based on your requirements
    // ...
  
    // If no specific answer is found, return null
    return null;
  };
  
  const handleFileSelect = async (file) => {
    let content = '';

    try {
      if (file.type === 'application/pdf') {
        // Handle PDF files
        const pdfData = await fetch(URL.createObjectURL(file)).then((res) => res.arrayBuffer());
        const pdfDataTypedArray = new Uint8Array(pdfData);

        const pdfDoc = await pdfjs.getDocument({ data: pdfDataTypedArray }).promise;
        const numPages = pdfDoc.numPages;

        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();

          // eslint-disable-next-line no-loop-func
          textContent.items.forEach((textItem) => {
            content += textItem.str + ' ';
          });
        }
        setSelectedFile({ name: file.name, content });

        // Update stored file names in state and local storage
        const updatedStoredFileNames = [...storedFileNames, file.name];
        setStoredFileNames(updatedStoredFileNames);
        saveFileNamesToLocalStorage(updatedStoredFileNames);
      } else {
        // Handle other file types (e.g., plain text)
        content = await file.text();
      }
    } catch (error) {
      console.error(`Error reading file content: ${file.name}`, error);
    }
    
    setSelectedFile({ name: file.name, content });
  };

  const handleEditFileName = (file) => {
    const newFileName = prompt('Enter the new file name:', file.name);

    if (newFileName && newFileName.trim() !== file.name) {
      // Update the file name
      const updatedFiles = files.map((f) =>
        f.name === file.name ? { ...f, name: newFileName.trim() } : f
      );

      setFiles(updatedFiles);

      // Update the fileData state with the new file name
      setFileData((prevFileData) => {
        const updatedFileData = { ...prevFileData };
        updatedFileData[newFileName.trim()] = updatedFileData[file.name];
        delete updatedFileData[file.name];
        return updatedFileData;
      });

      // Update the selectedFile state if the selected file is being edited
      if (selectedFile.name === file.name) {
        setSelectedFile({ name: newFileName.trim(), content: selectedFile.content });
      }
    }
  };

  const handleDeleteFile = (file) => {
    if (window.confirm(`Are you sure you want to delete ${file.name}?`)) {
      // Remove the file from the list of files
      setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));

      // Clear the selected file and its content if it's the selected one
      if (selectedFile.name === file.name) {
        setSelectedFile({ name: '', content: '' });
      }
      const updatedStoredFileNames = storedFileNames.filter((name) => name !== file.name);
      setStoredFileNames(updatedStoredFileNames);
      saveFileNamesToLocalStorage(updatedStoredFileNames);

      // Remove the file from the fileData state
      setFileData((prevFileData) => {
        const updatedFileData = { ...prevFileData };
        delete updatedFileData[file.name];
        return updatedFileData;
      });
    }
  };

  const toggleListening = () => {
    console.log('Toggling listening');
    if (!listening) {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    } else {
      SpeechRecognition.stopListening();
    }
  };
  

  
  const handleShowMoreOrLess = () => {
    if (showMore) {
      setVisibleFiles(files.length);
    } else {
      setVisibleFiles(2);
    }
    setShowMore(!showMore);
  };



  return (
    <div className="main-container">
      <div className="side-bar">
        <div className="close-image-container">
          <img
            src="https://icon-library.com/images/close-icon-svg/close-icon-svg-26.jpg"
            className="close-icon"
            alt="Close Icon"
          />
        </div>
        <div className="side-bar-first">
          <h1>Your Documents</h1>
          <h3>Upload your files here </h3>
          <div className="side-bar-box">
            <FileUploader onFileChange={handleFileChange} onDrop={handleDrop} onFileSelect={handleFileSelect} />
            {files.length > 0 && (
              <div>
                <h2>Selected Files</h2>
                {files.slice(0, showMore ? files.length : 2).map((file, index) => (
                  <div key={index} className="main-files">
                    <div onClick={() => handleFileSelect(file)} className="file-name">
                      {file.name || 'Unnamed File'}
                    </div>
                    <div onClick={() => handleEditFileName(file)}>
                      <img src="./Resources/edit.png" className="edit-button" alt="Edit" />
                    </div>
                    <div onClick={() => handleDeleteFile(file)}>
                      <img src="./Resources/dele.png" className="delete-button" alt="Delete" />
                    </div>
                  </div>
                ))}
                {files.length > 2 && (
                  <div>
                    <button onClick={handleShowMoreOrLess}>
                      {showMore ? 'Show More' : 'Show Less'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="main-page">
        <h1>Chat with Multiple Files</h1>
        <h3>Ask a question about my Documents:</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion();
          }}
        >
          <TextExtractor selectedFile={selectedFile} fileData={fileData} />
          {listening && <div className="transcript">{transcript}</div>}
          <button type="submit" className="send-button" disabled={listening}>
            {listening ? 'Processing...' : 'Send'}
          </button>
          <input
            type="text"
            className="input-promt fixed-input"
            placeholder="Enter your prompt here"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </form>
        <img
          src="https://tse2.mm.bing.net/th?id=OIP.XMzC99H16BDekgA9hkOHbAHaHa&pid=Api&P=0&h=220"
          className="microphone-icon"
          onClick={toggleListening}
          alt="Microphone Icon"
        />
      </div>
    </div>
  );
};

export default App;