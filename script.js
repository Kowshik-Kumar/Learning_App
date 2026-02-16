const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

// Mobile menu toggle for small screens.
const setupMenuToggle = () => {
  const toggle = $(".menu-toggle");
  const header = $(".site-header");
  if (!toggle || !header) return;

  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
};

// In-page screen navigation for the single-page sections.
const setupScreenNavigation = () => {
  const screens = $$(".screen");
  if (!screens.length) return;

  const setActiveScreen = (id) => {
    screens.forEach((screen) => {
      screen.classList.toggle("is-active", screen.id === id);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-target]");
    if (!target) return;
    const id = target.getAttribute("data-target");
    const next = $(`#${id}`);
    if (!next) return;
    event.preventDefault();
    setActiveScreen(id);
  });
};

// Multi-step onboarding with progress indicator.
const setupOnboarding = () => {
  const form = $("[data-onboarding]");
  if (!form) return;

  const steps = $$(".onboarding-step", form);
  const dots = $$(".progress-dot");
  const backButton = $("[data-step-back]", form);
  const nextButton = $("[data-step-next]", form);
  const error = $(".form-error", form);
  let currentStep = 0;

  const updateStep = () => {
    steps.forEach((step, index) => {
      step.classList.toggle("is-active", index === currentStep);
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentStep);
    });
    backButton.disabled = currentStep === 0;
    nextButton.textContent = currentStep === steps.length - 1 ? "Finish" : "Next";
    error.textContent = "";
  };

  const validateStep = () => {
    const inputs = $$('input, select', steps[currentStep]);
    for (const input of inputs) {
      if (!input.checkValidity()) {
        error.textContent = input.validationMessage || "Please complete the required fields.";
        return false;
      }
    }
    return true;
  };

  backButton.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep -= 1;
      updateStep();
    }
  });

  nextButton.addEventListener("click", () => {
    if (!validateStep()) return;
    if (currentStep < steps.length - 1) {
      currentStep += 1;
      updateStep();
      return;
    }
    error.textContent = "You're all set! Redirecting to the course list.";
    setTimeout(() => {
      const courses = $("#courses");
      if (courses) {
        $$(".screen").forEach((screen) => screen.classList.remove("is-active"));
        courses.classList.add("is-active");
      }
    }, 900);
  });

  updateStep();
};

// Lightweight client-side validation for forms.
const setupFormValidation = () => {
  $$('form[data-validate]').forEach((form) => {
    form.addEventListener("submit", (event) => {
      const error = $(".form-error", form);
      if (error) error.textContent = "";

      if (!form.checkValidity()) {
        event.preventDefault();
        const firstInvalid = form.querySelector(":invalid");
        if (error) {
          error.textContent = firstInvalid?.validationMessage || "Please complete the form.";
        }
      }
    });
  });
};

// Toggle between login and signup panels.
const setupAuthTabs = () => {
  const tabs = $$(".tab");
  if (!tabs.length) return;

  const forms = $$('[data-auth]');

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");
      tabs.forEach((item) => {
        const isActive = item === tab;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", String(isActive));
      });
      forms.forEach((form) => {
        form.hidden = form.getAttribute("data-auth") !== target;
      });
    });
  });
};

// Simple quiz engine for the demo questions.
const setupQuiz = () => {
  const quiz = $("[data-quiz]");
  if (!quiz) return;

  const questions = [
    {
      question: "What is the first step in most AI projects?",
      options: [
        "Collect and prepare data",
        "Deploy the model",
        "Choose UI colors",
      ],
      answer: 0,
    },
    {
      question: "Which metric is commonly used for classification?",
      options: ["Accuracy", "Mean squared error", "Word count"],
      answer: 0,
    },
    {
      question: "Why use a validation set?",
      options: [
        "To tune model performance",
        "To store user passwords",
        "To design the interface",
      ],
      answer: 0,
    },
  ];

  const currentEl = $("[data-quiz-current]", quiz);
  const totalEl = $("[data-quiz-total]", quiz);
  const questionEl = $("[data-quiz-question]", quiz);
  const optionsEl = $(".quiz-options", quiz);
  const prevButton = $("[data-quiz-prev]", quiz);
  const nextButton = $("[data-quiz-next]", quiz);
  const error = $("[data-quiz-error]", quiz);
  const result = $("[data-quiz-result]", quiz);
  const scoreEl = $("[data-quiz-score]", quiz);

  let currentIndex = 0;
  let selections = Array(questions.length).fill(null);

  const renderQuestion = () => {
    const current = questions[currentIndex];
    currentEl.textContent = String(currentIndex + 1);
    totalEl.textContent = String(questions.length);
    questionEl.textContent = current.question;
    optionsEl.innerHTML = "";
    error.textContent = "";

    current.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-option";
      button.textContent = option;
      if (selections[currentIndex] === index) {
        button.classList.add("is-selected");
      }
      button.addEventListener("click", () => {
        selections[currentIndex] = index;
        renderQuestion();
      });
      optionsEl.appendChild(button);
    });

    prevButton.disabled = currentIndex === 0;
    nextButton.textContent = currentIndex === questions.length - 1 ? "Finish" : "Next";
  };

  const showResult = () => {
    const score = selections.reduce((total, answer, index) => {
      return total + (answer === questions[index].answer ? 1 : 0);
    }, 0);
    scoreEl.textContent = `${score}/${questions.length}`;
    result.hidden = false;
  };

  prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      renderQuestion();
    }
  });

  nextButton.addEventListener("click", () => {
    if (selections[currentIndex] === null) {
      error.textContent = "Pick an answer to continue.";
      return;
    }
    if (currentIndex < questions.length - 1) {
      currentIndex += 1;
      renderQuestion();
      return;
    }
    nextButton.disabled = true;
    prevButton.disabled = true;
    optionsEl.innerHTML = "";
    showResult();
  });

  renderQuestion();
};

// Randomized quiz flow for the dedicated quiz page.
const setupQuizPage = () => {
  const quiz = $("[data-quiz-page]");
  if (!quiz) return;

  const container = $("[data-quiz]", quiz);
  const questionEl = $("[data-quiz-question]", quiz);
  const optionsEl = $("[data-quiz-options]", quiz);
  const progressEl = $("[data-quiz-progress]", quiz);
  const countEl = $("[data-quiz-count]", quiz);
  const percentEl = $("[data-quiz-percent]", quiz);
  const nextButton = $("[data-quiz-next]", quiz);

  if (!container || !questionEl || !optionsEl || !progressEl || !countEl || !percentEl || !nextButton) return;

  const bank = [
    {
      question: "What is the primary function of an activation function in a neural network?",
      options: [
        "To initialize weights",
        "To introduce non-linearity",
        "To calculate loss",
        "To update gradients",
      ],
      answer: 1,
    },
    {
      question: "Which dataset split is used to tune hyperparameters?",
      options: ["Training", "Validation", "Test", "Production"],
      answer: 1,
    },
    {
      question: "What does backpropagation compute?",
      options: [
        "Prediction outputs",
        "Weight gradients",
        "Input normalization",
        "Data augmentation",
      ],
      answer: 1,
    },
    {
      question: "Which metric is best for imbalanced classification?",
      options: ["Accuracy", "F1 score", "MSE", "R-squared"],
      answer: 1,
    },
    {
      question: "What is the goal of regularization?",
      options: [
        "Increase training error",
        "Reduce overfitting",
        "Expand dataset size",
        "Speed up inference",
      ],
      answer: 1,
    },
    {
      question: "Which optimizer adapts learning rates per parameter?",
      options: ["SGD", "Adam", "Batch Norm", "Dropout"],
      answer: 1,
    },
    {
      question: "What does an epoch represent?",
      options: [
        "One forward pass",
        "One full pass over the dataset",
        "One layer update",
        "One gradient step only",
      ],
      answer: 1,
    },
  ];

  const shuffle = (items) => {
    const array = [...items];
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const questionCount = 5;
  const questions = shuffle(bank).slice(0, questionCount).map((item) => {
    const options = shuffle(item.options);
    return {
      question: item.question,
      options,
      answer: options.indexOf(item.options[item.answer]),
    };
  });

  let currentIndex = 0;
  let selectedIndex = null;

  const render = () => {
    const current = questions[currentIndex];
    questionEl.textContent = current.question;
    optionsEl.innerHTML = "";
    selectedIndex = null;

    current.options.forEach((option, index) => {
      const label = document.createElement("label");
      label.className = "quiz-option-card card";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "quiz";
      input.addEventListener("change", () => {
        selectedIndex = index;
        $$(".quiz-option-card", optionsEl).forEach((card) => card.classList.remove("is-selected"));
        label.classList.add("is-selected");
      });

      const text = document.createElement("span");
      text.className = "quiz-option-text";
      text.textContent = option;

      label.appendChild(input);
      label.appendChild(text);
      optionsEl.appendChild(label);
    });

    const percent = Math.round(((currentIndex + 1) / questionCount) * 100);
    progressEl.style.width = `${percent}%`;
    countEl.textContent = `Question ${currentIndex + 1} of ${questionCount}`;
    percentEl.textContent = `${percent}%`;
    nextButton.textContent = currentIndex === questionCount - 1 ? "Finish" : "Next";
  };

  nextButton.addEventListener("click", () => {
    if (selectedIndex === null) return;
    if (currentIndex < questionCount - 1) {
      currentIndex += 1;
      render();
      return;
    }
    nextButton.textContent = "Done";
    nextButton.disabled = true;
  });

  render();
};

document.addEventListener("DOMContentLoaded", () => {
  setupMenuToggle();
  setupScreenNavigation();
  setupOnboarding();
  setupFormValidation();
  setupAuthTabs();
  setupQuiz();
  setupQuizPage();
});
