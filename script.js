// 1. Set dimensions and margins
const margin = {top: 30, right: 160, bottom: 60, left: 80},
      width = 900 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// 2. Append SVG
const svg = d3.select("#chart")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("#tooltip");

// 3. Load Data
d3.csv("institutional_news.csv").then(data => {
    
    // Parse strings to numbers
    data.forEach(d => {
        d.num_articles = +d.num_articles;
        d.avg_tone = +d.avg_tone;
    });

    // Scales
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.avg_tone)).nice()
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.num_articles)]).nice()
        .range([height, 0]);

    // Color palette for topics
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    // Add X Gridlines
    svg.append("g")			
        .attr("class", "grid")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5).tickSize(-height).tickFormat(""));

    // Add Y Gridlines
    svg.append("g")			
        .attr("class", "grid")
        .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""));

    // Add X Axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .append("text")
            .attr("class", "axis-label")
            .attr("x", width / 2)
            .attr("y", 45)
            .style("text-anchor", "middle")
            .text("Average Tone (Negative ← → Positive)");

    // Add Y Axis
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format(".2s")))
        .append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", -height / 2)
            .style("text-anchor", "middle")
            .text("Total Article Volume");

    // Add Circles
    svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.avg_tone))
            .attr("cy", d => y(d.num_articles))
            .attr("r", 10)
            .style("fill", d => color(d.topic))
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(100).style("opacity", 1);
                tooltip.html(`
                    <div style="font-weight:bold; border-bottom:1px solid #ccc; margin-bottom:5px; padding-bottom:3px;">
                        ${d.topic.toUpperCase()}
                    </div>
                    <strong>Date:</strong> ${d.date}<br/>
                    <strong>Tone Score:</strong> ${d.avg_tone.toFixed(2)}<br/>
                    <strong>Articles:</strong> ${d.num_articles.toLocaleString()}
                `)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", (event) => {
                tooltip.style("left", (event.pageX + 15) + "px")
                       .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(300).style("opacity", 0);
            });

    // Add Legend
    const topics = Array.from(new Set(data.map(d => d.topic)));
    const legend = svg.selectAll(".legend")
        .data(topics)
        .enter().append("g")
        .attr("transform", (d, i) => `translate(${width + 25}, ${i * 25})`);

    legend.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("rx", 3)
        .style("fill", color);

    legend.append("text")
        .attr("x", 22)
        .attr("y", 12)
        .style("font-size", "12px")
        .text(d => d.charAt(0).toUpperCase() + d.slice(1));

}).catch(err => {
    console.error("D3 Load Error:", err);
    document.getElementById('error').style.display = 'block';
});
