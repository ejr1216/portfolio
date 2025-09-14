// docs/assets/js/kpis.js
document.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("data/kpi.json?" + Date.now());
  const data = await res.json();

  const months = data.monthly.map(m => m.month);
  const hours = data.monthly.map(m => m.hours);
  const cumulative = hours.reduce((acc, v, i) => { acc.push((acc[i-1]||0)+v); return acc; }, []);
  const byProjectLabels = data.leaderboard.map(x => x.project);
  const byProjectHours = data.leaderboard.map(x => x.hours);

  const commonOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { ticks: { maxRotation: 0 } }, y: { beginAtZero: true } }
  };

  new Chart(document.getElementById("chartMonthly"), {
    type: "line",
    data: { labels: months, datasets: [{ data: hours, pointRadius: 3 }] },
    options: { ...commonOpts, plugins: { title: { display: true, text: "Monthly Hours Saved" }, legend:{display:false} } }
  });

  new Chart(document.getElementById("chartByProject"), {
    type: "bar",
    data: { labels: byProjectLabels, datasets: [{ data: byProjectHours }] },
    options: { ...commonOpts, plugins: { title: { display: true, text: "Hours Saved by Project" } } }
  });

  new Chart(document.getElementById("chartCumulative"), {
    type: "line",
    data: { labels: months, datasets: [{ data: cumulative, pointRadius: 3 }] },
    options: { ...commonOpts, plugins: { title: { display: true, text: "Cumulative Hours Saved" } } }
  });
});
