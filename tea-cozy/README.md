# Tea Cozy

This project is a website for a fictional tea shop called "Tea Cozy." It utilizes HTML for the structure and content, and CSS for styling, with a strong emphasis on Flexbox for layout.

Here is the screenshot of the desired project outcome ![Screenshot Tea Cozy](./Project-tea-cozy-redline.jpg)


## Overview

The website consists of the following main sections:

* **Header:** Contains the logo and navigation links.
* **Mission:** A banner section highlighting the company's mission statement.
* **Featured Tea:** Showcases the "Tea of the Month" and other featured tea products.
* **Locations:** Displays the locations of the Tea Cozy shops.
* **Footer:** Contains contact information and copyright details.

## Flexbox Implementation

Flexbox is used extensively throughout the project to create responsive and flexible layouts. Here are some key examples:

* **Header:**
    * `display: flex;`, `justify-content: space-between;`, and `align-items: center;` are used to position the logo and navigation items. This ensures they are spaced correctly and vertically aligned, regardless of content height.

* **Mission (Banner):**
    * `display: flex;`, `align-items: center;`, and `justify-content: center;` are used to center the mission statement text within the banner image.

* **Featured Tea (Image Container):**
    * `display: flex;`, `flex-wrap: wrap;`, `justify-content: space-around;`, and `align-items: center;` are used to create a responsive grid of tea images. 
    * `flex-wrap: wrap;` is crucial for ensuring the images wrap to the next line on smaller screens. 
    * `justify-content: space-around;` distributes space evenly between and around the images.

* **Locations:**
    * `display: flex;`, `flex-direction: column;`, `justify-content: space-evenly;`, and `align-items: center;` are used in the main container to organize the locations section.  
    * The individual city containers also use flexbox (`display:flex`, `flex-direction: column`, `justify-content: space-evenly`, `align-items: center`) to structure the city information.

* **General Layout**
    * The classes `flex-container` are used to center the main sections on the page.

## File Structure

* `index.html`:  The main HTML file containing the structure of the website.
* `style.css`:  The CSS file containing the styles for the website, including flexbox properties.
* `images/`:  A directory containing all the images used on the website.

## HTML Structure

The HTML file is structured using semantic HTML5 elements:

* `<header>`:  For the website header.
* `<nav>`:  For the navigation menu.
* `<main>`:  For the main content of the page.
* `<section>`:  For the different sections of the page (Mission, Featured Tea, Locations).
* `<footer>`:  For the website footer.

Each section uses `<div>` elements to structure the content and apply styles.  Images are included using the `<img>` tag, and links are created using the `<a>` tag.

## CSS Styling

The CSS file (`style.css`) handles the visual presentation of the website.  It includes:

* General styles for the `html` and `body` elements, including font, colors, and background.
* Styles for headings, paragraphs, links, and images.
* Styles for the header, navigation, main sections, and footer.
* Flexbox properties for layout, as described above.
* Media queries for basic responsiveness (adjusting layout for smaller screens).

## How to Run the Project

1.  Clone the repository or download the files.
2.  Open the `index.html` file in a web browser.

## Potential Improvements

* **Enhanced Responsiveness:** The current media query is basic.  More sophisticated media queries could be added to optimize the layout for various screen sizes and devices (e.g., tablets, mobile phones).
* **Accessibility:** Further improvements could be made to enhance the website's accessibility, such as:
    * Adding more descriptive `alt` text to images.
    * Ensuring sufficient color contrast.
    * Using ARIA attributes where necessary.
* **CSS Organization:** For larger projects, consider better CSS organization (e.g., using a CSS preprocessor like Sass or organizing CSS into multiple files).

## Author

[Your Name/Username]

## License

[Optional: Add a license, e.g., MIT License]
