// docs/assets/js/kpis.js
document.addEventListener("DOMContentLoaded", async () => {
  const meta = document.querySelector('meta[name="baseurl"]');
  const base = meta ? meta.content : "";
  const join = (a, b) => (a.endsWith("/") ? a.slice(0, -1) : a) + "/" + (b.startsWith("/") ? b.slice(1) : b);
  const url = join(base || "", "data/kpi.json") + "?" + Date.now();

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("kpi.json fetch failed " + res.status);
    const data = await res.json();

    const months = data.monthly.map(m => m.month);
    const hours = data.monthly.map(m => m.hours);
    const cumulative = hours.reduce((a, v, i) => { a.push((a[i-1]||0)+v); return a; }, []);
    const byProjectLabels = data.leaderboard.map(x => x.project);
    const byProjectHours = data.leaderboard.map(x => x.hours);

    const common = { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} };

    new Chart(document.getElementById("chartMonthly"), {
      type: "line",
      data: { labels: months, datasets: [{ data: hours, pointRadius: 3 }] },
      options: { ...common, plugins:{ title:{ display:true, text:"Monthly Hours Saved" } } }
    });

    new Chart(document.getElementById("chartByProject"), {
      type: "bar",
      data: { labels: byProjectLabels, datasets: [{ data: byProjectHours }] },
      options: { ...common, plugins:{ title:{ display:true, text:"Hours Saved by Project" } } }
    });

    new Chart(document.getElementById("chartCumulative"), {
      type: "line",
      data: { labels: months, datasets: [{ data: cumulative, pointRadius: 3 }] },
      options: { ...common, plugins:{ title:{ display:true, text:"Cumulative Hours Saved" } } }
    });
  } catch (e) {
    console.error(e);
    // leave static image fallbacks visible
  }
});
