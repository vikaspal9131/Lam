const phrases = [
    "Enter a URL...",
    "Paste your link here...",
    "Type something amazing...",
    "Drop your website link...",
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



document.getElementById('summaryForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const url = document.getElementById('urlInput').value;

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

  // Clear previous content
  summaryPara.textContent = '';
  codeDiv.innerHTML = '';
  outputBox.classList.remove('hidden');

  // Show summary
  summaryPara.textContent = data.summary || "No summary.";

  // Show code + explanation one by one
  if (data.code_explanation) {
    data.code_explanation.forEach(block => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('mb-4');

      // Create code block with dark background
      const codeBlock = document.createElement('pre');
      const codeElement = document.createElement('code');
      codeElement.textContent = block.code;
      codeElement.classList.add('language-javascript'); // You can change the language if needed

      codeBlock.appendChild(codeElement);
      
      // Apply Tailwind classes with more specificity for dark background and text color
      codeBlock.classList.add('rounded', 'overflow-x-auto', 'bg-[#171717]', 'text-white', 'p-4');

      // Apply syntax highlighting
      setTimeout(() => hljs.highlightElement(codeElement), 0);

      // Create copy button
      const copyBtn = document.createElement('button');
      copyBtn.textContent = 'Copy Code';
      copyBtn.classList.add('copy-btn', 'mt-2', 'px-4', 'py-2', 'bg-green-500', 'text-black', 'rounded');
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(block.code).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy Code'; }, 1500); // Reset button text after 1.5s
        });
      });

      // Add copy button below code
      codeBlock.appendChild(copyBtn);

      const explanation = document.createElement('p');
      explanation.textContent = block.explanation;
      explanation.classList.add('mt-2');

      wrapper.appendChild(codeBlock);
      wrapper.appendChild(explanation);
      codeDiv.appendChild(wrapper);
    });
  }

  // Show key points as list
  if (data.key_points) {
    const keyPointsHeading = document.createElement('h3');
    keyPointsHeading.classList.add('text-4xl', 'mt-8');
    keyPointsHeading.textContent = "Key Points";
    codeDiv.appendChild(keyPointsHeading);

    const ul = document.createElement('ul');
    ul.classList.add('mt-[20px]', 'list-disc', 'pl-5'); // Added list style

    data.key_points.forEach(point => {
      const li = document.createElement('li');
      li.textContent = point;
      ul.appendChild(li);
    });

    codeDiv.appendChild(ul);
  }

  // Handle error
  if (data.error) {
    alert(data.error);
    outputBox.classList.add('hidden');
  }
});
