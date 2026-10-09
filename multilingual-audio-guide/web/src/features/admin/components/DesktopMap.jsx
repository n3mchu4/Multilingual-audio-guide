import { useState } from "react";
import { places, mapPoints, busRoutesByPlace } from "../data/desktopData";

export default function DesktopMap({
  lang,
  tr,
  currentPlace,
  openDetail,
  detail = false,
}) {
  const [from, setFrom] = useState(0),
    [to, setTo] = useState(2);
  const [route, setRoute] = useState(null);
  const [busTarget, setBusTarget] = useState(null);
  const routePoints = () => {
    if (!route || route[0] === route[1]) return null;
    const [a, b] = route,
      start = mapPoints[a],
      end = mapPoints[b],
      midX = (start.x + end.x) / 2;
    return [
      start,
      {
        x: Math.max(7, Math.min(92, midX + (a % 2 ? 10 : -8))),
        y: start.y + (end.y - start.y) * 0.34,
      },
      {
        x: Math.max(7, Math.min(92, midX + (b % 2 ? -7 : 8))),
        y: start.y + (end.y - start.y) * 0.68,
      },
      end,
    ];
  };
  const points = routePoints();
  return (
    <>
      <div className="map-card">
        <div className="map-top">
          <h3>{tr("mapTitle")}</h3>
          <span>{tr("mapDemo")}</span>
        </div>
        <div className="map-canvas" aria-label={tr("mapDemo")}>
          <svg
            className="route-overlay"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {points && (
              <>
                <polyline
                  points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                />
                {[points[0], points[3]].map((p, i) => (
                  <g key={i}>
                    <circle className="route-halo" cx={p.x} cy={p.y} r="3.2" />
                    <circle
                      className={i ? "route-end" : "route-start"}
                      cx={p.x}
                      cy={p.y}
                      r="2.2"
                    />
                    <text
                      className="route-map-label"
                      x={Math.min(78, p.x + 3)}
                      y={Math.max(8, p.y - 3)}
                    >
                      {i ? "B" : "A"}
                    </text>
                  </g>
                ))}
              </>
            )}
          </svg>
          {[
            [7, 15, "BẾN NGHÉ"],
            [48, 10, "ĐA KAO"],
            [56, 82, "PHỐ ĐI BỘ"],
            [6, 77, "SÔNG SÀI GÒN"],
            [65, 42, "QUẬN 1"],
          ].map(([x, y, label]) => (
            <span
              key={label}
              className="map-label"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {label}
            </span>
          ))}
          {places.map((p, i) => (
            <button
              type="button"
              key={p.name.en}
              className={`map-pin ${i === currentPlace ? "active" : ""}`}
              style={{
                left: `${mapPoints[i].x - (i === 1 ? 7 : 5)}%`,
                top: `${mapPoints[i].y - 4}%`,
              }}
              onClick={() => openDetail(i)}
            >
              <span className="pin-icon">•</span>
              <span>{tr(`place${i}`)}</span>
            </button>
          ))}
          <button
            className="bus-map-button"
            type="button"
            onClick={() => setBusTarget(detail ? currentPlace : to)}
          >
            🚌 {tr("busConnect")}
          </button>
          {busTarget !== null && (
            <div className="bus-popup">
              <div className="bus-popup-head">
                <div>
                  <strong>🚌 {tr("busTitle")}</strong>
                  <small>
                    {tr("busDestination")}: {places[busTarget].name[lang]}
                  </small>
                </div>
                <button
                  className="bus-popup-close"
                  type="button"
                  onClick={() => setBusTarget(null)}
                  aria-label={tr("busClose")}
                >
                  ×
                </button>
              </div>
              <select
                className="bus-destination-select"
                value={busTarget}
                onChange={(e) => setBusTarget(Number(e.target.value))}
                aria-label={tr("busDestination")}
              >
                {places.map((p, i) => (
                  <option key={p.name.en} value={i}>
                    {p.name[lang]}
                  </option>
                ))}
              </select>
              <div className="bus-route-list">
                {busRoutesByPlace[busTarget].map((item) => (
                  <article className="bus-route-item" key={item.no}>
                    <span className="bus-route-number">{item.no}</span>
                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        {tr("busStop")}: {item.stop}
                      </small>
                    </div>
                  </article>
                ))}
              </div>
              <p className="bus-disclaimer">{tr("busDisclaimer")}</p>
            </div>
          )}
        </div>
        {!detail && (
          <div className="map-legend">
            <span>
              <i className="legend-dot" />
              {tr("mapLegend")}
            </span>
            <span>↗ {tr("mapLegend2")}</span>
          </div>
        )}
      </div>
      <div className="route-card">
        <h3>{tr("routeTitle")}</h3>
        <select
          className="route-input"
          aria-label={tr("routeFrom")}
          value={from}
          onChange={(e) => {
            const value = Number(e.target.value);
            setFrom(value);
            setRoute([value, to]);
          }}
        >
          {places.map((p, i) => (
            <option key={p.name.en} value={i}>
              {p.name[lang]}
            </option>
          ))}
        </select>
        <select
          className="route-input"
          aria-label={tr("routeTo")}
          value={to}
          onChange={(e) => {
            const value = Number(e.target.value);
            setTo(value);
            setRoute([from, value]);
          }}
        >
          {places.map((p, i) => (
            <option key={p.name.en} value={i}>
              {p.name[lang]}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="primary-btn"
          style={{ width: "100%", padding: 11 }}
          onClick={() => setRoute([from, to])}
        >
          {tr("routeBtn")}
        </button>
        {route && (
          <div className="route-result">
            {route[0] === route[1] ? (
              tr("routeSame")
            ) : (
              <>
                <strong>↗ {tr("routeResultTitle")}</strong>
                {places[route[0]].name[lang]} → {places[route[1]].name[lang]}
                <ol>
                  {tr("routeSteps").map((step, i) => (
                    <li key={step}>
                      {step} {i < 2 ? places[route[1]].name[lang] : ""}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        )}
        <div
          style={{
            fontSize: 10,
            color: "#8b969a",
            lineHeight: 1.6,
            marginTop: 10,
          }}
        >
          {tr("routeNote")}
        </div>
      </div>
    </>
  );
}
