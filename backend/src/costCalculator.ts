import { PricingClient, GetProductsCommand } from "@aws-sdk/client-pricing";

const pricingClient = new PricingClient({
  region: "us-east-1", // The pricing API is only available in us-east-1 and ap-south-1
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Helper function to map human-readable region names to pricing API locations
const getRegionLocation = (region: string): string => {
  const regionMap: { [key: string]: string } = {
    "eu-north-1": "EU (Stockholm)",
    "us-east-1": "US East (N. Virginia)",
    // Add other regions as needed
  };
  return regionMap[region] || region;
};

export async function getEC2InstanceCost(instanceType: string, region: string): Promise<string> {
  try {
    const command = new GetProductsCommand({
      ServiceCode: "AmazonEC2",
      Filters: [
        { Type: "TERM_MATCH", Field: "location", Value: getRegionLocation(region) },
        { Type: "TERM_MATCH", Field: "instanceType", Value: instanceType },
        { Type: "TERM_MATCH", Field: "operatingSystem", Value: "Linux" }, // Assuming Linux
        { Type: "TERM_MATCH", Field: "tenancy", Value: "Shared" }, // Assuming shared tenancy
        { Type: "TERM_MATCH", Field: "preInstalledSw", Value: "NA" },
      ],
    });

    const { PriceList } = await pricingClient.send(command);

    if (PriceList && PriceList.length > 0) {
      const priceData = JSON.parse(PriceList[0] as string);
      const onDemandTerms = priceData.terms.OnDemand;
      const priceDimension = Object.values(onDemandTerms)[0] as any;
      const hourlyPrice = parseFloat(Object.values(priceDimension.priceDimensions)[0].pricePerUnit.USD);
      
      // Calculate monthly cost (730 hours in a month on average)
      const monthlyCost = hourlyPrice * 730;
      return `$${monthlyCost.toFixed(2)}`;
    }
    return "Cost not found";
  } catch (error) {
    console.error(`Error fetching price for EC2 instance ${instanceType}:`, error);
    return "Error";
  }
}

export async function getEBSVolumeCost(volumeType: string, sizeGb: number, region: string): Promise<string> {
  try {
    const command = new GetProductsCommand({
      ServiceCode: "AmazonEC2",
      Filters: [
        { Type: "TERM_MATCH", Field: "location", Value: getRegionLocation(region) },
        { Type: "TERM_MATCH", Field: "volumeApiName", Value: volumeType }, // e.g., gp3, gp2
      ],
    });

    const { PriceList } = await pricingClient.send(command);

    if (PriceList && PriceList.length > 0) {
      const priceData = JSON.parse(PriceList[0] as string);
      const onDemandTerms = priceData.terms.OnDemand;
      const priceDimension = Object.values(onDemandTerms)[0] as any;
      const pricePerGbMonth = parseFloat(Object.values(priceDimension.priceDimensions)[0].pricePerUnit.USD);

      const monthlyCost = pricePerGbMonth * sizeGb;
      return `$${monthlyCost.toFixed(2)}`;
    }
    return "Cost not found";
  } catch (error) {
    console.error(`Error fetching price for EBS volume ${volumeType}:`, error);
    return "Error";
  }
}