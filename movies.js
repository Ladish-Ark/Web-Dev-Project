document.addEventListener("DOMContentLoaded", function () {
  const table = document.getElementById("movie-table");
  const tbody = document.getElementById("movies");

  let moviesData = []; // Variable to store the movie data
  let currentPage = 1; // Current page number
  const moviesPerPage = 20; // Number of movies to display per page

  fetchMoviesData()
    .then((data) => {
      moviesData = data;
      renderMovies(currentPage);
      renderPagination();
    })
    .catch((error) => {
      console.error(error);
    });

  function fetchMoviesData() {
    return new Promise((resolve, reject) => {
      fetch("/Movie-Data/")
        .then((response) => response.text())
        .then((html) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          const fileLinks = Array.from(doc.querySelectorAll("a")).map(
            (a) => a.href
          );

          const csvUrl = fileLinks
            .filter((link) => link.endsWith(".csv"))
            .sort()
            .reverse()[0];

          fetch(csvUrl)
            .then((response) => response.text())
            .then((data) => {
              const parsedData = Papa.parse(data, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
              }).data;

              const processedData = parsedData.map((movie) => ({
                date: movie["Date"],
                title: movie["Name"],
                year: movie["Year"],
                rating: movie["Rating"],
                link: movie["Letterboxd URI"],
              }));

              resolve(processedData);
            })
            .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    });
  }

  function renderMovies(page) {
    const startIndex = (page - 1) * moviesPerPage;
    const endIndex = startIndex + moviesPerPage;
    const moviesToShow = moviesData
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort movies by date, newest first
      .slice(startIndex, endIndex);

    tbody.innerHTML = ""; // Clear existing table rows

    moviesToShow.forEach((movie) => {
      const row = document.createElement("tr");
      const dateCell = document.createElement("td");
      const titleCell = document.createElement("td");
      const yearCell = document.createElement("td");
      const ratingCell = document.createElement("td");
      const linkCell = document.createElement("td");
      const link = document.createElement("a");

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

      tbody.appendChild(row);
    });
  }

  function renderPagination() {
    const totalPages = Math.ceil(moviesData.length / moviesPerPage);
    const paginationContainer = document.getElementById("pagination-container");

    paginationContainer.innerHTML = ""; // Clear existing pagination

    const previousButton = document.createElement("button");
    previousButton.textContent = "Previous";
    previousButton.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage--;
        renderMovies(currentPage);
        renderPagination();
      }
    });

    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.addEventListener("click", function () {
      if (currentPage < totalPages) {
        currentPage++;
        renderMovies(currentPage);
        renderPagination();
      }
    });

    paginationContainer.appendChild(previousButton);

    const displayedPages = calculateDisplayedPages(totalPages, currentPage);

    displayedPages.forEach((page) => {
      const pageLink = document.createElement("button");
      pageLink.textContent = page;

      if (page === currentPage) {
        pageLink.classList.add("active-page");
      }

      pageLink.addEventListener("click", function () {
        currentPage = page;
        renderMovies(currentPage);
        renderPagination();
      });

      paginationContainer.appendChild(pageLink);
    });

    paginationContainer.appendChild(nextButton);
  }

  function calculateDisplayedPages(totalPages, currentPage) {
    const maxDisplayedPages = 5; // Maximum number of pages to display in the pagination

    let displayedPages = [];

    if (totalPages <= maxDisplayedPages) {
      displayedPages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      const middleIndex = Math.floor(maxDisplayedPages / 2);
      let startPage = currentPage - middleIndex;
      let endPage = currentPage + middleIndex;

      if (startPage < 1) {
        startPage = 1;
        endPage = maxDisplayedPages;
      } else if (endPage > totalPages) {
        endPage = totalPages;
        startPage = totalPages - maxDisplayedPages + 1;
      }

      displayedPages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    }

    return displayedPages;
  }

  const inputTitle = document.getElementById("search-title");
  const inputDate = document.getElementById("search-date");
  const inputRating = document.getElementById("search-rating");

  inputTitle.addEventListener("input", searchMovies);
  inputDate.addEventListener("input", searchMovies);
  inputRating.addEventListener("input", searchMovies);

  function searchMovies() {
    const filterTitle = inputTitle.value.toUpperCase();
    const filterDate = inputDate.value.toUpperCase();
    const filterRating = inputRating.value.toUpperCase();

    const rows = tbody.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const titleCell = row.getElementsByTagName("td")[1];
      const dateCell = row.getElementsByTagName("td")[0];
      const ratingCell = row.getElementsByTagName("td")[3];

      if (titleCell && dateCell && ratingCell) {
        const titleMatch = titleCell.textContent || titleCell.innerText;
        const dateMatch = dateCell.textContent || dateCell.innerText;
        const ratingMatch = ratingCell.textContent || ratingCell.innerText;

        if (
          titleMatch.toUpperCase().indexOf(filterTitle) > -1 &&
          dateMatch.toUpperCase().indexOf(filterDate) > -1 &&
          ratingMatch.toUpperCase().indexOf(filterRating) > -1
        ) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      }
    }
  }
});