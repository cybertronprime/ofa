# One Factor Analysis Tool

The One Factor Analysis Tool is a web-based application designed to perform statistical analysis on experimental data with a single factor (treatment) and multiple replications. It supports both Completely Randomized Design (CRD) and Randomized Complete Block Design (RBD).

## Table of Contents

- [Features](#features)
- [Usage](#usage)
- [Examples](#examples)
  - [Crop Yield Study (CRD)](#crop-yield-study-crd)
  - [Fertilizer Effect Study (RBD)](#fertilizer-effect-study-rbd)
- [Analysis](#analysis)
- [Visualizations](#visualizations)
- [Contributing](#contributing)
- [License](#license)

## Features

- Flexible input for multiple treatments and replications
- Support for CRD and RBD designs
- Optional data transformations (Square Root and Angular)
- Calculation of ANOVA table
- Post-hoc analysis using Tukey's HSD test
- Visualization of results using bar charts, box plots, and scatter plots
- Import and export data functionality

## Usage

1. Access the One Factor Analysis Tool at [https://cybertronprime.github.io/ofa/](https://cybertronprime.github.io/ofa/).
2. Enter the number of treatments, replications, and sets.
3. Select the design type (CRD or RBD).
4. Choose the data transformation method (if applicable).
5. Enter the experimental data in the provided textarea, using space or tab as separators.
6. Click the "Analyze Data" button to perform the analysis.
7. View the ANOVA table, treatment means, Tukey's HSD test results, and visualizations.
8. Export the results as a text file using the "Download Results" button.

## Examples

### Crop Yield Study (CRD)

A researcher wants to compare the yield of three different corn varieties (A, B, C) using a Completely Randomized Design with four replications.

| Variety A | Variety B | Variety C |
|-----------|-----------|-----------|
| 123       | 142       | 147       |
| 123       | 149       | 172       |
| 131       | 147       | 143       |
| 133       | 134       | 139       |

### Fertilizer Effect Study (RBD)

An agronomist is studying the effect of three fertilizer treatments (A, B, C) on tomato plant height using a Randomized Complete Block Design with four blocks.

| Treatment A | Treatment B | Treatment C |
|-------------|-------------|-------------|
| 25.0        | 28.5        | 41.3        |
| 23.0        | 24.9        | 42.5        |
| 24.3        | 27.3        | 41.3        |
| 26.5        | 29.2        | 46.5        |

## Analysis

The One Factor Analysis Tool calculates the following:

- Sum of Squares (SS)
- Degrees of Freedom (DF)
- Mean Squares (MS)
- F-value for treatments, blocks (in RBD), and error
- Grand mean and individual treatment means
- Tukey's HSD test results

## Visualizations

The tool provides three types of visualizations to help understand the data and analysis results:

1. **Treatment Means Comparison**: A bar chart comparing the means of each treatment.
2. **Box Plot of Treatments**: A box plot displaying the distribution of data for each treatment.
3. **Scatter Plot of Treatments**: A scatter plot showing the individual data points for each treatment and replication.

## Contributing

Contributions to the One Factor Analysis Tool are welcome! If you find any bugs, have suggestions for improvements, or want to add new features, please submit an issue or pull request on the [GitHub repository](https://github.com/cybertronprime/ofa).

## License

The One Factor Analysis Tool is open-source software licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

Feel free to customize and expand upon this README template based on your specific project requirements and additional details you want to include.
