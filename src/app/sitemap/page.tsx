import Link from "next/link";

export default function SitemapPage() {
  // List of all routes in the application
  const routes = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
    { path: "/publications", label: "Publications" },
    { path: "/teams", label: "Teams" },
    { path: "/data", label: "Data Table" },
    { path: "/trade-map", label: "Trade Volume Map" },
    { path: "/countries", label: "Country Profiles" },
    { path: "/map-dashboard", label: "Interactive Map" },
    { path: "/db-map", label: "Database Map" },
    { path: "/geo-data", label: "Geo Data" },
    { path: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/doc/Strategic+Dependency+Final+Report.pdf", label: "Strategic Dependency Report (PDF)" },
  ];

  // Define categories for better organization
  const categories = {
    "Main Pages": ["/", "/about", "/contact", "/publications", "/teams"],
    "Data Visualization": ["/data", "/trade-map", "/countries", "/map-dashboard", "/db-map", "/geo-data"],
    "Reports": ["https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/doc/Strategic+Dependency+Final+Report.pdf"],
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Site Navigation</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(categories).map(([category, paths]) => (
          <div key={category} className="border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">{category}</h2>
            <ul className="space-y-3">
              {routes
                .filter(route => paths.includes(route.path))
                .map(route => (
                  <li key={route.path} className="hover:bg-gray-50 rounded-md transition-colors">
                    <Link 
                      href={route.path}
                      className="block p-2 text-blue-600 hover:text-blue-700"
                    >
                      {route.label}
                      <span className="text-gray-500 text-sm ml-2">{route.path}</span>
                    </Link>
                  </li>
                ))
              }
            </ul>
          </div>
        ))}
      </div>
      
      <div className="mt-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">All Pages (Alphabetical)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes
            .sort((a, b) => a.label.localeCompare(b.label))
            .map(route => (
              <Link 
                key={route.path}
                href={route.path}
                className="p-3 text-blue-600 hover:text-blue-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                {route.label}
              </Link>
            ))
          }
        </div>
      </div>
    </div>
  );
} 