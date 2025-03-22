# Contact Form Page

This project is a contact form page designed to gather user information and inquiries about business pricing. It is built using HTML for structure and content, and CSS for styling.

## Overview

The page consists of the following main sections:

* **Logo:** Displays the company logo.
* **Header:** Contains the main heading and a descriptive paragraph explaining the purpose of the form.
* **Form:** The contact form itself, which includes fields for name, company email, company size, subject, and message.

## HTML Structure

The HTML structure is organized as follows:

* `<!DOCTYPE html>`: Declares the document type.
* `<head>`: Contains metadata, including character set, viewport settings for responsiveness, page description, linked Google Fonts, stylesheet link, and page title.
* `<body>`: Contains the visible page content.
* `<div>`: Used to contain the logo image.
* `<header>`: Contains the `<h1>` heading and `<p>` paragraph, providing context for the form.
* `<form>`: Defines the contact form.
* `<fieldset>`: Used to group the form elements related to personal information.
* `<div>` elements with class `container` and `inside-container`: Used for structuring the form layout, particularly for arranging labels and input fields.
* `<label>`: Defines labels for form input elements.
* `<input>`: Used for text and email input fields.
* `<select>`: Used for dropdown menus (Company Size and Subject).
* `<option>`: Defines options within the dropdown menus.
* `<textarea>`: Used for the message input area.
* `<button>`: Used for the "Contact Sales" submit button.

## CSS Styling

The `styles.css` file handles the visual presentation of the page. Key aspects of the styling include:

* **Global Styles:**
    * `html` and `body` styles define font family, text color, background gradient, and padding.
* **Header Styling:**
    * Flexbox (`display: flex;`, `flex-direction: column;`, `align-items: center;`) is used to center the heading and paragraph.
    * Font sizes and margins are defined for the heading (`h1`) and paragraph (`p`).
* **Logo Styling:**
    * Styles the logo image's display and dimensions.
* **Form Styling:**
    * Flexbox (`display: flex;`, `flex-direction: column;`, `align-items: center;`, `justify-content: center;`) is used to style the form container.
    * Background color, padding, border-radius, and margin are defined for the form.
* **Personal Information Section Styling:**
    * Styles for the fieldset are removed (`border: none;`).
* **Message Section Styling:**
    * Flexbox (`display: flex;`, `flex-direction: column;`, `justify-content: center;`, `align-items: left;`) is used to style the message container.
    * Styles for the label and textarea are defined.
* **Button Styling:**
    * Styles the "Contact Sales" button's display, font, color, width, margin, padding, background color, border-radius, and border.
    * Hover effect styles are defined to change the background color and text color.
* **Container Styling:**
    * Flexbox (`display: flex;`, `flex-wrap: wrap;`, `justify-content: space-evenly;`, `align-items: center;`) is used to style the layout of form elements.
* **Inside Container Styling:**
    * Margins and width are defined for the inner container elements.
* **Label Styling:**
    * Display, margin, and font size are defined for form labels.
* **Input Tab Styling:**
    * Display, width, padding, border-radius, border, and font weight are defined for input fields.
* **Dropdown Styling:**
    * Display, padding, width, border-radius, border, and font weight are defined for dropdown menus.

## File Structure

* `index.html`: The main HTML file containing the structure of the contact form page.
* `styles.css`: The CSS file containing the styles for the contact form page.
* `images/`: Directory containing the `Logo.svg` file.

## How to Run the Project

1.  Clone the repository or download the files.
2.  Open the `index.html` file in a web browser.

## Potential Improvements

* **Form Validation:** Implement client-side and server-side form validation to ensure data accuracy and completeness.
* **Accessibility:**
    * Ensure proper label associations with form elements.
    * Check for sufficient color contrast.
    * Provide clear error messages for form validation.
* **Responsiveness:**
    * Thoroughly test and adjust styles for various screen sizes and devices to ensure optimal viewing and usability.
* **User Experience (UX):**
    * Consider adding visual cues or feedback to enhance the user's interaction with the form.

## Author

\[BlackNate.github.com]

## License

none