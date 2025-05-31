import React from "react";
import ServicePage from "../serviceProvider/ServicePage";
import AdminPage from "../serviceProvider/ServiceProviderDashbord";
import SPpaymentDetails from "../serviceProvider/SPpaymentDetails";
import SpBookingDetails from "../serviceProvider/SPbookingDetails";

function SpHome() {
  return (
    <div
      className="container-fluid"
      style={{
        overflowX: "hidden",
        backgroundColor: "#F8CAD7",
      }}
    >
      <h1
        className="text-center mb-2 mt-4 page-title"
        style={{ color: "#54A3C1" }}
      >
        Service Provider Dash Board
      </h1>

      <div
        className="col-12 mb-4"
        style={{
          // padding: "20px",
          borderRadius: "8px",

          overflowX: "hidden",
        }}
      >
        <SPpaymentDetails />
      </div>

      <div
        className="col-12 mb-4"
        style={{
          // backgroundColor: 'white',
          padding: "20px",
          borderRadius: "8px",

          overflowX: "hidden",
        }}
      >
        <SpBookingDetails />
      </div>

      <div className="row" style={{ display: "flex", overflowX: "hidden" }}>
        <div
          className="col-12 col-md-6 mb-4"
          style={{
            // backgroundColor: 'white',
            padding: "20px",
            borderRadius: "8px",

            overflowX: "hidden",
          }}
        >
          <ServicePage />
        </div>
        <div
          className="col-12 col-md-6 mb-4"
          style={{
            // backgroundColor: 'white',
            padding: "20px",
            borderRadius: "8px",

            overflowX: "hidden",
          }}
        >
          <AdminPage />
        </div>
      </div>
    </div>
  );
}

export default SpHome;
