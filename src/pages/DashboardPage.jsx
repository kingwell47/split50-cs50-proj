import React from "react";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  return (
    <div>
      <Link to="/groups/" className="btn btn-sm btn-secondary">
        Groups
      </Link>
      <Link to="/groups/create" className="btn btn-sm btn-secondary">
        Create Group
      </Link>
    </div>
  );
};

export default DashboardPage;
