(function(){
    function getHashParams() {
        var hashParams = {};
        var e,
          r = /([^&;=]+)=?([^&;]*)/g,
          q = window.location.hash.substring(1);
        while ((e = r.exec(q))) {
          hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
      }
      
      function retrieveTracks(timeRangeSlug, domNumber, domPeriod) {
        $.ajax({
          url: `https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=${timeRangeSlug}`,
          headers: {
            Authorization: "Bearer " + access_token,
          },
          success: function (response) {
            let data = {
              trackList: response.items,
              total: 0,
              date: today.toLocaleDateString("en-US", dateOptions).toUpperCase(),
              json: true,
            };
            for (var i = 0; i < data.trackList.length; i++) {
              data.trackList[i].name = data.trackList[i].name.toUpperCase() + " - ";
              data.total += data.trackList[i].duration_ms;
              data.trackList[i].id = (i + 1 < 10 ? "0" : "") + (i + 1);
              let minutes = Math.floor(data.trackList[i].duration_ms / 60000);
              let seconds = (
                (data.trackList[i].duration_ms % 60000) /
                1000
              ).toFixed(0);
              data.trackList[i].duration_ms =
                minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
              for (var j = 0; j < data.trackList[i].artists.length; j++) {
                data.trackList[i].artists[j].name =
                  data.trackList[i].artists[j].name.trim();
                data.trackList[i].artists[j].name =
                  data.trackList[i].artists[j].name.toUpperCase();
                if (j != data.trackList[i].artists.length - 1) {
                  data.trackList[i].artists[j].name =
                    data.trackList[i].artists[j].name + ", ";
                }
              }
            }
            minutes = Math.floor(data.total / 60000);
            seconds = ((data.total % 60000) / 1000).toFixed(0);
            data.total = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    
            userProfilePlaceholder.innerHTML = userProfileTemplate({
              tracks: data.trackList,
              total: data.total,
              time: data.date,
              num: domNumber,
              name: displayName,
              period: domPeriod,
            });
    
            document
              .getElementById("download")
              .addEventListener("click", () => downloadImg(timeRangeSlug));
          },
        });
      }

  let params = getHashParams();

  let access_token = params.access_token,
    dev_token = params.dev_token,
    client = params.client,
    error = params.error;

  if (error) {
    alert("There was an error during the authentication");
  } else {
    if (client === "spotify" && access_token) {
      $.ajax({
        url: "https://api.spotify.com/v1/me",
        headers: {
          Authorization: "Bearer " + access_token,
        },
        success: function (response) {
          displayName = response.display_name.toUpperCase();
          $("#login").hide();
          $("#loggedin").show();
        },
      });
    }
    else {
      // render initial screen
      $("#login").show();
      $("#loggedin").hide();
    }

    document.getElementById("short_term").addEventListener(
      "click",
      function () {
        retrieveTracks("short_term", 1, "LAST MONTH");
      },
      false
    );
    
  }
})();
