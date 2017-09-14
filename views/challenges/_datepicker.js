$(".start")
  .datepicker({
    beforeShowDay: function(date) {
      return [date.getDay() == 1, "", "Challenges must start on Mondays."];
    },
    minDate: new Date(),
    defaultDate: new Date("#{minDate}")
  })
  .on("change", function() {
    var date = $(this).datepicker("getDate");
    date.setDate(date.getDate() + 63);
    $(".end").val(
      `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    );
  });
