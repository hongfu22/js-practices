for (let num = 1; num <= 20; num++) {
  output_num = num;
  if (num % 3 == 0 && num % 5 == 0) {
    output_num = "FizzBuzz";
  } else if (num % 5 == 0) {
    output_num = "Buzz";
  } else if (num % 3 == 0) {
    output_num = "Fizz";
  }
  console.log(output_num);
}
