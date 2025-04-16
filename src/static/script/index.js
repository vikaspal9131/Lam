import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
  const auth = getAuth();

  
  let currentUser = null;

  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
    } else {
      currentUser = null;
    }
  });

  
  document.getElementById('summaryForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

  
    if (!currentUser) {
      window.location.href = "/login";  
      return;
    }

    
    const url = document.getElementById('urlInput').value;

    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ url: url })
      });

      const data = await response.json();

      const outputBox = document.getElementById('output');
      const summaryPara = document.getElementById('summary');
      const codeDiv = document.getElementById('codeExplanations');

      summaryPara.textContent = '';
      codeDiv.innerHTML = '';
      outputBox.classList.remove('hidden');

      summaryPara.textContent = data.summary || "No summary.";

      if (data.code_explanation && data.code_explanation.length > 0) {
        data.code_explanation.forEach(block => {
          const wrapper = document.createElement('div');
          wrapper.classList.add('mb-4');

          const codeBlock = document.createElement('pre');
          const codeElement = document.createElement('code');
          codeElement.textContent = block.code;
          codeElement.classList.add('language-javascript');

          codeElement.style.backgroundColor = '#171717';
          codeElement.style.color = 'white';
          codeElement.style.display = 'block';
          codeElement.style.padding = '1rem';
          codeElement.style.borderRadius = '0.5rem';
          codeElement.style.overflowX = 'auto';

          codeBlock.appendChild(codeElement);
          codeBlock.style.backgroundColor = '#171717';
          codeBlock.style.borderRadius = '0.5rem';

          setTimeout(() => hljs.highlightElement(codeElement), 0);

          const copyBtn = document.createElement('button');
          copyBtn.textContent = 'Copy Code';
          copyBtn.classList.add('copy-btn', 'mt-2', 'px-4', 'py-2', 'bg-green-500', 'text-black', 'rounded');
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(block.code).then(() => {
              copyBtn.textContent = 'Copied!';
              setTimeout(() => { copyBtn.textContent = 'Copy Code'; }, 1500);
            });
          });

          codeBlock.appendChild(copyBtn);

          const explanation = document.createElement('p');
          explanation.textContent = block.explanation;
          explanation.classList.add('mt-2');

          wrapper.appendChild(codeBlock);
          wrapper.appendChild(explanation);
          codeDiv.appendChild(wrapper);
        });
      } else {
        const noCodeMsg = document.createElement('p');
        noCodeMsg.textContent = "No code available.";
        noCodeMsg.classList.add('text-gray-500', 'mt-4');
        codeDiv.appendChild(noCodeMsg);
      }

      if (data.key_points) {
        const keyPointsHeading = document.createElement('h3');
        keyPointsHeading.classList.add('text-4xl', 'mt-8');
        keyPointsHeading.textContent = "Key Points";
        codeDiv.appendChild(keyPointsHeading);

        const ul = document.createElement('ul');
        ul.classList.add('mt-[20px]', 'list-disc', 'pl-5');

        data.key_points.forEach(point => {
          const li = document.createElement('li');
          li.textContent = point;
          ul.appendChild(li);
        });

        codeDiv.appendChild(ul);
      }

      if (data.error) {
        alert(data.error);
        outputBox.classList.add('hidden');
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
      alert(" Something went wrong while fetching the summary.");
    }
  });



// Typing effect 
  const phrases = [
    "Share your documentation link here...",
    "Paste the URL of your documentation...",
    "Enter the link to your project docs...",
    "Drop your documentation page URL...",
  ];
  
    const input = document.getElementById("urlInput");
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
  
    function typeEffect() {
      const currentPhrase = phrases[currentPhraseIndex];
      if (isDeleting) {
        currentCharIndex--;
      } else {
        currentCharIndex++;
      }
  
      const updatedText = currentPhrase.substring(0, currentCharIndex);
      input.setAttribute("placeholder", updatedText);
  
      if (!isDeleting && currentCharIndex === currentPhrase.length) {
        isDeleting = true;
        setTimeout(typeEffect, 1500); 
      } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        setTimeout(typeEffect, 500); 
      } else {
        setTimeout(typeEffect, isDeleting ? 10 : 10);
      }
    }
  
    typeEffect();
  