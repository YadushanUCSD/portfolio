import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');
const titleElement = document.querySelector('.projects-title');
titleElement.textContent = `${projects.length} Projects`;
let colors = d3.scaleOrdinal(d3.schemeTableau10);
let selectedIndex = -1;
function renderPieChart(projectsGiven) {
    let newRolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year,
    );
    let newData = newRolledData.map(([year, count]) => {
      return { value: count, label: year };
    });
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let newArcs = newArcData.map((d) => arcGenerator(d));
    d3.select('svg').selectAll('path').remove();
    d3.select('.legend').selectAll('li').remove();
    function applyFilter(idx) {
      selectedIndex = selectedIndex === idx ? -1 : idx;
      let filteredProjects = [];
      if (selectedIndex === -1) {
        filteredProjects = projects;
      } else {
        let selectedYear = newData[selectedIndex].label;
        filteredProjects = projects.filter((p) => p.year == selectedYear);
      }
      renderProjects(filteredProjects, projectsContainer, 'h2');
      renderPieChart(projects);
    }
    newArcs.forEach((arc, idx) => {
      d3.select('svg')
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(idx))
        .attr('class', idx === selectedIndex ? 'selected' : '')
        .on('click', () => applyFilter(idx));
    });
    let legend = d3.select('.legend');
    newData.forEach((d, idx) => {
      legend
        .append('li')
        .attr('class', idx === selectedIndex ? 'legend-item selected' : 'legend-item')
        .attr('style', `--color:${colors(idx)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
        .on('click', () => applyFilter(idx));
    });
  }
renderPieChart(projects);
let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
  titleElement.textContent = `${filteredProjects.length} Projects`;
});