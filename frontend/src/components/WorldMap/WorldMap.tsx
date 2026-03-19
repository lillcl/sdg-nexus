// src/components/WorldMap/WorldMap.tsx — V9 rendering logic, proper container sizing
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import type { Topology } from "topojson-specification";
import { feature } from "topojson-client";
import { useMapStore } from "@/store";
import { scoreColor } from "@/types";

// 修正類型定義

const ISO_MAP: Record<string, string> = {
  "004": "AFG",
  "008": "ALB",
  "012": "DZA",
  "020": "AND",
  "024": "AGO",
  "028": "ATG",
  "032": "ARG",
  "036": "AUS",
  "040": "AUT",
  "031": "AZE",
  "044": "BHS",
  "048": "BHR",
  "050": "BGD",
  "052": "BRB",
  "112": "BLR",
  "056": "BEL",
  "084": "BLZ",
  "204": "BEN",
  "064": "BTN",
  "068": "BOL",
  "070": "BIH",
  "072": "BWA",
  "076": "BRA",
  "096": "BRN",
  "100": "BGR",
  "854": "BFA",
  "108": "BDI",
  "116": "KHM",
  "120": "CMR",
  "124": "CAN",
  "132": "CPV",
  "140": "CAF",
  "144": "LKA",
  "148": "TCD",
  "152": "CHL",
  "156": "CHN",
  "170": "COL",
  "174": "COM",
  "178": "COG",
  "180": "COD",
  "188": "CRI",
  "191": "HRV",
  "192": "CUB",
  "196": "CYP",
  "203": "CZE",
  "208": "DNK",
  "262": "DJI",
  "214": "DOM",
  "218": "ECU",
  "818": "EGY",
  "222": "SLV",
  "226": "GNQ",
  "232": "ERI",
  "233": "EST",
  "231": "ETH",
  "238": "FLK",
  "246": "FIN",
  "242": "FJI",
  "250": "FRA",
  "266": "GAB",
  "270": "GMB",
  "268": "GEO",
  "276": "DEU",
  "288": "GHA",
  "300": "GRC",
  "320": "GTM",
  "324": "GIN",
  "624": "GNB",
  "328": "GUY",
  "332": "HTI",
  "340": "HND",
  "348": "HUN",
  "352": "ISL",
  "356": "IND",
  "360": "IDN",
  "364": "IRN",
  "368": "IRQ",
  "372": "IRL",
  "376": "ISR",
  "380": "ITA",
  "388": "JAM",
  "392": "JPN",
  "400": "JOR",
  "398": "KAZ",
  "404": "KEN",
  "296": "KIR",
  "408": "PRK",
  "410": "KOR",
  "414": "KWT",
  "417": "KGZ",
  "418": "LAO",
  "428": "LVA",
  "422": "LBN",
  "426": "LSO",
  "430": "LBR",
  "434": "LBY",
  "438": "LIE",
  "440": "LTU",
  "442": "LUX",
  "450": "MDG",
  "454": "MWI",
  "458": "MYS",
  "462": "MDV",
  "466": "MLI",
  "470": "MLT",
  "478": "MRT",
  "480": "MUS",
  "484": "MEX",
  "496": "MNG",
  "498": "MDA",
  "492": "MCO",
  "504": "MAR",
  "508": "MOZ",
  "104": "MMR",
  "516": "NAM",
  "524": "NPL",
  "528": "NLD",
  "554": "NZL",
  "558": "NIC",
  "562": "NER",
  "566": "NGA",
  "807": "MKD",
  "578": "NOR",
  "512": "OMN",
  "586": "PAK",
  "591": "PAN",
  "598": "PNG",
  "600": "PRY",
  "604": "PER",
  "608": "PHL",
  "616": "POL",
  "620": "PRT",
  "634": "QAT",
  "642": "ROU",
  "643": "RUS",
  "646": "RWA",
  "882": "WSM",
  "682": "SAU",
  "686": "SEN",
  "688": "SRB",
  "694": "SLE",
  "703": "SVK",
  "705": "SVN",
  "090": "SLB",
  "706": "SOM",
  "710": "ZAF",
  "728": "SSD",
  "724": "ESP",
  "729": "SDN",
  "740": "SUR",
  "752": "SWE",
  "756": "CHE",
  "760": "SYR",
  "762": "TJK",
  "764": "THA",
  "626": "TLS",
  "768": "TGO",
  "776": "TON",
  "780": "TTO",
  "788": "TUN",
  "792": "TUR",
  "795": "TKM",
  "798": "TUV",
  "800": "UGA",
  "804": "UKR",
  "784": "ARE",
  "826": "GBR",
  "840": "USA",
  "858": "URY",
  "860": "UZB",
  "548": "VUT",
  "862": "VEN",
  "704": "VNM",
  "887": "YEM",
  "894": "ZMB",
  "716": "ZWE",
  "831": "GGY",
  "832": "JEY",
  "534": "SXM",
  "531": "CUW",
  "533": "ABW",
  "748": "SWZ",
  "674": "SMR",
  "336": "VAT",
  "275": "PSE",
  "659": "KNA",
  "662": "LCA",
  "670": "VCT",
  "308": "GRD",
  "212": "DMA",
  "016": "ASM",
  "638": "REU",
  "474": "MTQ",
  "254": "GUF",
  "312": "GLP",
  "175": "MYT",
  "234": "FRO",
};

export default function WorldMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const {
    countryData,
    selectedGoal,
    selectedCountry,
    setSelectedCountry,
    setTooltip,
  } = useMapStore();

  useEffect(() => {
    if (!svgRef.current || Object.keys(countryData).length === 0) return;
    const svg = d3.select(svgRef.current);

    // Use getBoundingClientRect for reliable dimensions after layout
    const rect = svgRef.current.getBoundingClientRect();
    const w =
      rect.width > 0
        ? rect.width
        : (svgRef.current.parentElement?.clientWidth ?? 960);
    const h =
      rect.height > 0
        ? rect.height
        : (svgRef.current.parentElement?.clientHeight ?? 500);

    svg.selectAll("*").remove();

    const proj = d3
      .geoNaturalEarth1()
      .scale(w / 6.3)
      .translate([w / 2, h / 2]);
    const path = d3.geoPath().projection(proj);
    const g = svg.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (e) => g.attr("transform", e.transform));
    svg.call(zoom);

    // Ocean sphere
    g.append("path")
      .datum({ type: "Sphere" })
      .attr("d", path as any)
      .attr("fill", "#08111f");

    // Graticule grid
    g.append("path")
      .datum(d3.geoGraticule()() as any)
      .attr("d", path as any)
      .attr("fill", "none")
      .attr("stroke", "#0d1e33")
      .attr("stroke-width", 0.4);

    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((r) => r.json())
      .then((topo: Topology) => {
        const countries = feature(topo, topo.objects["countries"]) as any;

        g.selectAll<SVGPathElement, any>("path.country")
          .data(countries.features)
          .enter()
          .append("path")
          .attr("class", "country")
          .attr("d", (d: any) => path(d) || "")
          .attr("fill", (d: any) => {
            const iso3 = ISO_MAP[String(d.id).padStart(3, "0")];
            const cd = iso3 ? countryData[iso3] : null;
            if (!cd) return "#1e2d42";
            const score = selectedGoal
              ? cd.scores[String(selectedGoal)]
              : cd.overall_score;
            return score != null ? scoreColor(score) : "#1e2d42";
          })
          .attr("stroke", (d: any) => {
            const iso3 = ISO_MAP[String(d.id).padStart(3, "0")];
            return iso3 === selectedCountry ? "#ffffff" : "#0a1525";
          })
          .attr("stroke-width", (d: any) => {
            const iso3 = ISO_MAP[String(d.id).padStart(3, "0")];
            return iso3 === selectedCountry ? 2 : 0.3;
          })
          .attr("cursor", "pointer")
          .on("mousemove", function (event, d: any) {
            const iso3 = ISO_MAP[String(d.id).padStart(3, "0")];
            const cd = iso3 ? countryData[iso3] : null;
            const geoName = d.properties?.name || iso3 || String(d.id);
            const score = cd
              ? selectedGoal
                ? cd.scores[String(selectedGoal)]
                : cd.overall_score
              : null;
            setTooltip({
              visible: true,
              name: cd?.name ?? geoName,
              score: score ?? null,
              x: event.clientX + 12,
              y: event.clientY - 28,
            });
            d3.select(this).attr("stroke", "#94a3b8").attr("stroke-width", 1.5);
          })
          .on("mouseleave", function (_, d: any) {
            const iso3 = ISO_MAP[String(d.id).padStart(3, "0")];
            const sel = iso3 === selectedCountry;
            d3.select(this)
              .attr("stroke", sel ? "#ffffff" : "#0a1525")
              .attr("stroke-width", sel ? 2 : 0.3);
            setTooltip({ visible: false });
          })
          .on("click", (_, d: any) => {
            const iso3 = ISO_MAP[String(d.id).padStart(3, "0")];
            if (iso3 && countryData[iso3]) setSelectedCountry(iso3);
          });
      });
  }, [
    countryData,
    selectedGoal,
    selectedCountry,
    setSelectedCountry,
    setTooltip,
  ]);

  return (
    <svg
      ref={svgRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
