module.exports = {
  ci: {
    collect: {
      url: [
        "http://127.0.0.1:3000/",
        "http://127.0.0.1:3000/training/journey",
        "http://127.0.0.1:3000/training/focus",
        "http://127.0.0.1:3000/training/brain-fit",
      ],
      numberOfRuns: 1,
      settings: {
        formFactor: "mobile",
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 2,
          disabled: false,
        },
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.80 }],
        "categories:accessibility": ["error", { minScore: 1.00 }],
        "categories:best-practices": ["error", { minScore: 1.00 }],
        "categories:seo": ["error", { minScore: 1.00 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./reports/lhci",
    },
  },
};
