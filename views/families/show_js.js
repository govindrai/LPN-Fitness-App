const spinner =
  '<div class="center"><img src="/images/spinner.gif" width="64px" height="64px" alt="loading indicator gif" /></div>';

let addPointsStateChanged = false;

// updates the #showBody container upon request of new date/week
function updateShow(e) {
  let weekInfo;

  // if changing weeks, send change direction and
  // monday's and sunday's dates (depending on direction, one is important)
  // in order to calculate the new week's dates
  if ($(e.target).hasClass("change-week")) {
    weekInfo = {
      direction: $(this).attr("id"),
      sunday: $("#sunday").data("date"),
      monday: $("#monday").data("date")
    };
    // otherwise is changing to a different date in the same week
    // send the requested date with a direction of none
    // and monday's date to calculate entire week's dates
  } else {
    weekInfo = {
      date: $(e.currentTarget)
        .find(".date")
        .data("date"),
      monday: $("#monday").data("date"),
      direction: "none"
    };
  }
  $("#dailyPoints").html(spinner);
  // send the weekInfo object and update the #showBody container
  $.ajax({
    url: window.location.pathname,
    data: { weekInfo }
  })
    .done(res => $("#showBody").html(res))
    .fail(() => console.log("Updating show failed"));
}

function removePointEntry(e) {
  const hiddenActionInput = $(e.target)
    .parent()
    .find('input[name="action"]');
  if (hiddenActionInput.val() === "update") {
    hiddenActionInput.val("delete");
    hiddenActionInput
      .parent()
      .find("input.calculated-points")
      .attr({ disabled: "disabled", novalidate: "novalidate" });
    hiddenActionInput.parent().hide();
  } else {
    hiddenActionInput.parent().remove();
  }
  calculateTotalPoints();
}

function hideAddPointsModal() {
  window.location.reload();
}

// retrieves HTML for a point entry input when a user
// selects an activity from the typeahead drop-down
function getActivityData(ev, suggestion) {
  $("#typeahead").typeahead("val", "");
  $("#typeahead").blur();

  $(".point-entries").append(spinner);
  $.ajax({
    url: `/activities/${suggestion}`
  })
    .done(res => {
      $(".point-entries")
        .find(".center")
        .replaceWith(res);
    })
    .fail(res => {
      console.log("getActivityData Failed", res);
    });
}

// gets activity objects and inject's typeahead's
// functionality into search activity input field
function getActivities() {
  $.ajax({
    url: "/activities"
  })
    .done(res => {
      const typeahead = $("#typeahead");
      typeahead.typeahead(
        {
          highlight: true,
          hint: "search.."
        },
        {
          name: "my-dataset",
          source: new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.whitespace,
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: res
          })
        }
      );
      typeahead.bind("typeahead:select", getActivityData);
      $(".twitter-typeahead").css("display", "block");
    })
    .fail(e => console.log(e));
}

// calculates each entries point value by multiplying scale * unit
// also calculates the total points since values changed
function calculateEntryPoints(e) {
  console.log("calculate entry points hit");
  var pointsEntry = $(this)
    .parent()
    .parent()
    .parent();

  var activityPoints = pointsEntry.find(".activity-points").text();
  var activityPointsScale = pointsEntry.find(".activity-points-scale").text();

  var numOfUnits = $(this).val();

  if (numOfUnits == "") {
    pointsEntry.find("input.calculated-points").val(0);
    pointsEntry.find("div.calculated-points").text("0 POINTS");
  } else {
    var calculation = (parseFloat(activityPoints) /
      parseFloat(activityPointsScale) *
      parseFloat(numOfUnits)).toFixed(2);
    pointsEntry.find("input.calculated-points").val(calculation);
    pointsEntry.find("div.calculated-points").text(calculation + " POINTS");
  }
  calculateTotalPoints();
}

// calculates total points by adding each point entry's value
function calculateTotalPoints() {
  const pointEntries = $("input.calculated-points[disabled!=disabled]");
  const totalCalculatedPoints = $.makeArray(pointEntries)
    .reduce(
      (total, pointsEntryValue) =>
        total +
        ($(pointsEntryValue).val() === ""
          ? 0
          : parseFloat($(pointsEntryValue).val())),
      0
    )
    .toFixed(2);
  if (pointEntries.length === 0) {
    $("#submit-points-button").css("display", "none");
  } else {
    $("#submit-points-button").css("display", "block");
  }
  const pointString =
    pointEntries.length === 0 && totalCalculatedPoints === "0.00"
      ? ""
      : "TOTAL = " + totalCalculatedPoints + " POINTS";
  $("div.total-calculated-points").text(pointString);

  $("input.total-calculated-points").val(totalCalculatedPoints);
}

// Shows/Hides a users points
function toggleParticipantPoints(e) {
  if ($(e.target).attr("id") !== "edit-points") {
    $(this)
      .find(".points-entries-summaries")
      .slideToggle();
  }
}

function getTimeRemaining(endOfWeek) {
  const total = Date.parse(endOfWeek) - Date.parse(new Date()),
    days = Math.floor(total / (1000 * 60 * 60 * 24)),
    hours = Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes = Math.floor((total / 1000 / 60) % 60);
  document.getElementById(
    "timeRemaining"
  ).innerHTML = `${days} DAYS, ${hours} HOURS, ${minutes} MINUTES`;
}

function initializeClock() {
  const endtime = new Date($("#sunday").data("date"));
  endtime.setDate(endtime.getDate() + 1);

  var clock = document.getElementById("timeRemaining");
  var timeinterval = setInterval(() => getTimeRemaining(endtime), 1000);
}

function showAddPointsModal(e) {
  $("#add-points-container").toggle();
  window.scrollTo(0, 0);
  const editingPoints = $(e.target).attr("id") === "edit-points";
  if (!editingPoints) $("#typeahead").focus();
}

function getExistingPoints() {
  const addPointsButtonDate = $(".current-date .date").data("date");
  const participation = $("input[name='participation']").val();
  $.ajax({
    url: "/users/points",
    type: "PUT",
    data: { addPointsButtonDate, participation }
  })
    .done(res => {
      $("#point-entries").replaceWith(res);
      resolve();
    })
    .fail(e => console.log("getPointsFailed"));
}

function validatePointEntry(e) {
  $(e.target)
    .parent()
    .parent()
    .removeClass("error-field");
  $(e.target)
    .parent()
    .parent()
    .find(".error")
    .remove();
  if (parseInt(e.target.value) <= 0) {
    $(e.target)
      .parent()
      .parent()
      .addClass("error-field");
    $(e.target)
      .parent()
      .parent()
      .append(`<div class="error">Please enter a value greater than 0.</div>`);
  } else {
    $(e.target)
      .parent()
      .parent()
      .removeClass("error-field");
    $(e.target)
      .parent()
      .parent()
      .find(".error")
      .remove();
  }
}

$(document).ready(function() {
  initializeClock();
  getActivities();
});

$("body").on("click", ".participant", toggleParticipantPoints);
$("body").on("click", ".change-week", updateShow);
$("body").on("click", ".updatePoints", updateShow);
$("body").on("click", "#add-points-button", showAddPointsModal);
$("body").on("click", "#edit-points", showAddPointsModal);
$("body").on("click", "#x-button", hideAddPointsModal);
$("body").on("keyup", ".num-of-units", calculateEntryPoints);
$("body").on("click", ".trash", removePointEntry);
$("body").on("blur", ".num-of-units", validatePointEntry);
