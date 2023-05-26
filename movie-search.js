// movie-search.js

document.addEventListener("DOMContentLoaded", function() {
    var inputTitle, inputDate, inputRating, table, tr, tdTitle, tdDate, tdRating, i;
    inputTitle = document.getElementById("search-title");
    inputDate = document.getElementById("search-date");
    inputRating = document.getElementById("search-rating");
    inputTitle.addEventListener("input", searchMovies);
    inputDate.addEventListener("input", searchMovies);
    inputRating.addEventListener("input", searchMovies);

    function searchMovies() {
        var filterTitle = inputTitle.value.toUpperCase();
        var filterDate = inputDate.value.toUpperCase();
        var filterRating = inputRating.value.toUpperCase();
        table = document.getElementById("movie-table");
        tr = table.getElementsByTagName("tr");
        for (i = 0; i < tr.length; i++) {
            tdTitle = tr[i].getElementsByTagName("td")[1];
            tdDate = tr[i].getElementsByTagName("td")[0];
            tdRating = tr[i].getElementsByTagName("td")[3];
            if (tdTitle && tdDate && tdRating) {
                var titleMatch = tdTitle.textContent || tdTitle.innerText;
                var dateMatch = tdDate.textContent || tdDate.innerText;
                var ratingMatch = tdRating.textContent || tdRating.innerText;
                if (
                    titleMatch.toUpperCase().indexOf(filterTitle) > -1 &&
                    dateMatch.toUpperCase().indexOf(filterDate) > -1 &&
                    ratingMatch.toUpperCase().indexOf(filterRating) > -1
                ) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }
});
