// Informative assertions: Performance and Best Practices only warn, never
// fail the job. Thresholds are the baseline minus a margin for run-to-run noise.

// Both presets audit the same URLs, so URL patterns can't tell them apart;
// scripts/lighthouse.mjs sets LH_FORM_FACTOR for each group instead.
const desktop = process.env.LH_FORM_FACTOR === "desktop";

const config = {
  ci: {
    assert: {
      // LHCI defaults to the best run; median matches the reported baseline.
      aggregationMethod: "median-run",
      assertions: {
        "categories:performance": ["warn", { minScore: desktop ? 0.95 : 0.85 }],
        "categories:best-practices": ["warn", { minScore: 0.96 }],
      },
    },
  },
};

export default config;
