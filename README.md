#install
1. install nodejs+ npm:
   https://nodejs.org/en/download/

   type "node -v" in the command line to verify the node has been installed

2. install some packages
   goto the root directory in the windows command line or linux bash
   a. install expressjs using following command:
   
         npm install express
      
   b. install body-parser package using following command:
   
         npm install body-parser
      
   c. install Multer using following command:
   
         npm install multer

#run
in the root directory, type the following command in command line or linux bash
   node index.js [portNumber]


if you dont specify the portNumber, the default portNumber is 8080
Goto http://localhost:portNumber e.g http://localhost:8080 using a browser.

A modern desktop or mobile browser is recommended, e.g Chrome, IE10+, Safari


#API
You can also use the API call to upload the file and decipher file.

   POST  /postUpload/file
         
         Request: file0
         Response: {fileId: 'xxxx' }
         
         Description: upload a file, and get a fileId if upload successfully
         
   GET   /getDeciphered/file/{fileId}
   
         Response: { fileId: 'xxxxx', 
                     description: 'xxx'
                   }
         Description: get the deciphered result of the file with fileId, in the example if the fileId is 123.454
         
                      So the url should be like  /getDeciphered/file/123.454
                      
                      and the response is {fileId: '123.454', description: '九二三'}
                      
   GET  /getTask/file
   
         Response: { fileId: 'xxx',
                    fileContent: 'XXXXXXXXXXXXXX..XXXXXX'
                  }
          Description: get a original file to decipher.
        
   POST /postDeciphered/file
   
         Request: {fileId: xx, fileDescription: '一二三'}
         Response: {true}
         
         Description: send the deciphered result of the file to server.
   

