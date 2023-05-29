document.addEventListener("DOMContentLoaded", function () {  // Wait for the DOM to load and then grabs the elements from the HTML
  const table = document.getElementById("movie-table");
  const tbody = document.getElementById("movies");

  let moviesData = []; // Variable to store the movie data
  let currentPage = 1; // Current page number
  const moviesPerPage = 20; // Number of movies to display per page

  fetchMoviesData() // Fetch the movie data from the CSV file
    .then((data) => { // Once the data is fetched, store it in the moviesData variable and render the movies and pagination to the HTML page
      moviesData = data;
      renderMovies(currentPage);
      renderPagination();
    })
    .catch((error) => { // If there is an error, log it to the console
      console.error(error); 
    });



  function fetchMoviesData() {   // Function to fetch the movie data from the CSV file
    return new Promise((resolve, reject) => {  // Return a promise that will resolve with the movie data or reject with an error
      fetch("Movie-Data/")   // Fetch the the folder that contains the CSV file
        .then((response) => response.text()) // Once the folder is fetched, get the text from the response
        .then((html) => { // Once the text is fetched, parse it as HTML
          const parser = new DOMParser(); 
          const doc = parser.parseFromString(html, "text/html"); // Parse the HTML as a document

          const fileLinks = Array.from(doc.querySelectorAll("a")).map(  // Get all the links from the document and store them in an array
            (a) => a.href
          );

          const csvUrl = fileLinks  // Stores the variable fileLinks in the variable csvUrl
            .filter((link) => link.endsWith(".csv"))  // Filters the links to only include the ones that end with .csv
            .sort()  // Sorts the links
            .reverse()[0];  // Reverses the order of the links and returns the first one

          fetch(csvUrl)  // Fetch the CSV file
            .then((response) => response.text())  // Once the CSV file is fetched, get the text from the response
            .then((data) => {  // Once the text is fetched, parse it as CSV
              const parsedData = Papa.parse(data, {  // Parse the CSV as an object
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
              }).data;

              const processedData = parsedData.map((movie) => ({  // Process the data to only include the columns we need
                date: movie["Date"],
                title: movie["Name"],
                year: movie["Year"],
                rating: movie["Rating"],
                link: movie["Letterboxd URI"],
              }));

              resolve(processedData);  // Resolve the promise with the processed data
            })
            .catch((error) => reject(error));  // If there is an error, reject the promise with the error
        })
        .catch((error) => reject(error));  // If there is an error, reject the promise with the error
    });
  }

  function renderMovies(page) {  // Function to render the movies to the HTML page
    const startIndex = (page - 1) * moviesPerPage;  // Calculate the start index of the movies to display
    const endIndex = startIndex + moviesPerPage;  // Calculate the end index of the movies to display
    const moviesToShow = moviesData  // Get the movies to display
      .slice()  // Create a copy of the moviesData array
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort movies by date, newest first
      .slice(startIndex, endIndex); // Get the movies to display

    tbody.innerHTML = ""; // Clear existing table rows

    moviesToShow.forEach((movie) => {  // Loop through the movies to display and render them to the HTML page
      const row = document.createElement("tr");
      const dateCell = document.createElement("td");
      const titleCell = document.createElement("td");
      const yearCell = document.createElement("td");
      const ratingCell = document.createElement("td");
      const linkCell = document.createElement("td");
      const link = document.createElement("a");

       // Add the movie data to the table cells
      dateCell.textContent = movie.date; 
      titleCell.textContent = movie.title;  
      yearCell.textContent = movie.year;
      ratingCell.textContent = movie.rating;

      link.href = movie.link;   
      link.textContent = movie.link;
      linkCell.appendChild(link);  

      row.appendChild(dateCell);
      row.appendChild(titleCell);
      row.appendChild(yearCell);
      row.appendChild(ratingCell);
      row.appendChild(linkCell);

      tbody.appendChild(row);  // Add the table row to the table body
    });
  }

  function renderPagination() {  // Function to render the pagination to the HTML page
    const totalPages = Math.ceil(moviesData.length / moviesPerPage);  // Calculate the total number of pages
    const paginationContainer = document.getElementById("pagination-container");  // Get the pagination container element

    paginationContainer.innerHTML = ""; // Clear existing pagination

    const previousButton = document.createElement("button");  // Create the previous button
    previousButton.textContent = "Previous";  // Add text to the previous button
    previousButton.addEventListener("click", function () {  // Add an event listener to the previous button
      if (currentPage > 1) {  // If the current page is greater than 1, decrease the current page by 1 and render the movies and pagination
        currentPage--;
        renderMovies(currentPage);
        renderPagination();
      }
    });

    const nextButton = document.createElement("button");  // Create the next button
    nextButton.textContent = "Next";  // Add text to the next button
    nextButton.addEventListener("click", function () {  // Add an event listener to the next button
      if (currentPage < totalPages) {  // If the current page is less than the total number of pages, increase the current page by 1 and render the movies and pagination
        currentPage++;
        renderMovies(currentPage);
        renderPagination();
      }
    });

    paginationContainer.appendChild(previousButton);  // Add the previous button to the pagination container

    const displayedPages = calculateDisplayedPages(totalPages, currentPage);  // Calculate the pages to display in the pagination

    displayedPages.forEach((page) => {  // Loop through the pages to display and render them to the HTML page
      const pageLink = document.createElement("button"); 
      pageLink.textContent = page;

      if (page === currentPage) {  // If the page is the current page, add the active-page class to highlight the current number the user is on in the pagination
        pageLink.classList.add("active-page"); 
      }

      pageLink.addEventListener("click", function () { // Add an event listener to the page link
        currentPage = page; // Set the current page to the page number and render the movies and pagination
        renderMovies(currentPage);
        renderPagination();
      });

      paginationContainer.appendChild(pageLink); // Add the page link to the pagination container
    });

    paginationContainer.appendChild(nextButton); // Add the next button to the pagination container
  }


  function calculateDisplayedPages(totalPages, currentPage) { // Function to calculate the pages to display in the pagination
    const maxDisplayedPages = 5; // Maximum number of pages to display in the pagination at one time

    let displayedPages = []; // Array to store the pages to display in the pagination

    if (totalPages <= maxDisplayedPages) { // If the total number of pages is less than or equal to the maximum number of pages to display, display all pages
      displayedPages = Array.from({ length: totalPages }, (_, i) => i + 1); // Create an array of numbers from 1 to the total number of pages
    } else {
      const middleIndex = Math.floor(maxDisplayedPages / 2); // Calculate the middle index of the pagination
      let startPage = currentPage - middleIndex;
      let endPage = currentPage + middleIndex;

      if (startPage < 1) { // If the start page is less than 1, set the start page to 1 and calculate the end page
        startPage = 1;
        endPage = maxDisplayedPages;
      } else if (endPage > totalPages) { // If the end page is greater than the total number of pages, set the end page to the total number of pages and calculate the start page
        endPage = totalPages;
        startPage = totalPages - maxDisplayedPages + 1;
      }

      displayedPages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i); // Create an array of numbers from the start page to the end page
    }

    return displayedPages; // Return the pages to display in the pagination
  }

  // Get the search input elements and add event listeners to them to search the movies when the user types in the search box
  const inputTitle = document.getElementById("search-title");
  const inputDate = document.getElementById("search-date");
  const inputRating = document.getElementById("search-rating");

  inputTitle.addEventListener("input", searchMovies);
  inputDate.addEventListener("input", searchMovies);
  inputRating.addEventListener("input", searchMovies);


  function searchMovies() { // Function to search the movies
    const filterTitle = inputTitle.value.toUpperCase(); // Get the value of the title search box and convert it to uppercase
    const filterDate = inputDate.value.toUpperCase();
    const filterRating = inputRating.value.toUpperCase();

    const rows = tbody.getElementsByTagName("tr"); // Get all the rows in the table body

    for (let i = 0; i < rows.length; i++) { // Loop through the rows
      const row = rows[i];
      const titleCell = row.getElementsByTagName("td")[1];
      const dateCell = row.getElementsByTagName("td")[0];
      const ratingCell = row.getElementsByTagName("td")[3];

      if (titleCell && dateCell && ratingCell) { // If the title, date, and rating cells exist, get the text content of each cell and convert it to uppercase
        const titleMatch = titleCell.textContent || titleCell.innerText;
        const dateMatch = dateCell.textContent || dateCell.innerText;
        const ratingMatch = ratingCell.textContent || ratingCell.innerText;

        if ( // If the title, date, and rating match the search input, display the row, otherwise, hide the row
          titleMatch.toUpperCase().indexOf(filterTitle) > -1 &&
          dateMatch.toUpperCase().indexOf(filterDate) > -1 &&
          ratingMatch.toUpperCase().indexOf(filterRating) > -1
        ) {
          row.style.display = ""; // Display the row
        } else {
          row.style.display = "none"; // Hide the row
        }
      }
    }
  }
});