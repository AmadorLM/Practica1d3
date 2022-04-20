import * as d3 from "d3";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
const d3Composite = require("d3-composite-projections");
import { stats } from "./stats";
import { latLongCommunities } from "./communities";
// Covid data per community, cases accumulated until 19-04-2022
import { covid_04_2022 } from "./data/covid_04_2021";
// Covid data per community, cases accumulated until 19-04-2021
import { covid_04_2021 } from "./data/covid_04_2021";
// Import resultentry, type of data
import { ResultEntry } from "./data/covid_04_2021";

// set the affected color scale
// const color = d3
//   .scaleThreshold<number, string>()
//   .domain([0, 1, 100, 500, 700, 5000])
//   .range([
//     "#FFFFF",
//     "#FFE8E5",
//     "#F88F70",
//     "#CD6A4E",
//     "#A4472D",
//     "#7B240E",
//     "#540000",
//   ]);

// Calculating the maximum value
// I take the maximum value of covid in april 2022 to see the transition
// from 2021-2022
const maxCovid_04_2022 = covid_04_2022.reduce(
  (max, item) => (item.value > max ? item.value: max),
  0
)

// Fixing the scale of the radius for the circle of the number of cases 
const affectedRadiusScale = d3
  .scaleLinear()
  .domain([0, maxCovid_04_2022])
  .range([0, 70]); // 70 pixel max radius, we could calculate it relative to width and height

// Calculate the radius of each community depending on the number of cases
const calculateRadiusBasedOnAffectedCases = (comunidad: string) => {
  const entry = covid_04_2021.find((item) => item.name === comunidad);

  return entry ? affectedRadiusScale(entry.value) : 0;
};

// Defining the projection of the map
const aProjection = d3Composite.geoConicConformalSpain();

// Defining the path
const geoPath = d3.geoPath().projection(aProjection);

// Defining the feature of geojson
const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);

// Projecting the geojson fitting in a size
aProjection.fitSize([1024, 800], geojson);

// Defining the layout, body, svg, width, height and the background color
const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");

// Defining the geojson with the communities
svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  // use geoPath to convert the data into the current projection
  // https://stackoverflow.com/questions/35892627/d3-map-d-attribute
  .attr("d", geoPath as any);

// svg
//   .selectAll("circle")
//   .data(latLongCommunities)
//   .enter()
//   .append("circle")
//   .attr("class", "affected-marker")
//   .attr("r", (d) => calculateRadiusBasedOnAffectedCases(d.name))
//   .attr("cx", (d) => aProjection([d.long, d.lat])[0])
//   .attr("cy", (d) => aProjection([d.long, d.lat])[1]);

// Defining the chart that is going to change the covid cases
const updateChart = (data: ResultEntry[]) => {
  // Selecciono el path y actualizo los datos
  svg  
    .selectAll("circle")
    .data(latLongCommunities)
    .enter()
    .append("circle")
    .attr("class", "affected-marker")
    .attr("r", (d) => calculateRadiusBasedOnAffectedCases(d.name))
    .attr("cx", (d) => aProjection([d.long, d.lat])[0])
    .attr("cy", (d) => aProjection([d.long, d.lat])[1])
    .transition()
    .duration(500);
};

// Adding the data when click the button of april 2021
document
  .getElementById('april_2021')
  .addEventListener('click', () => {
    updateChart(covid_04_2021);
  });

// Adding the data when click the button of april 2022
document
  .getElementById('april_2022')
  .addEventListener('click', () => {
    updateChart(covid_04_2022);
  });
  