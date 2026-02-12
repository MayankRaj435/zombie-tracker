import { PricingClient, GetProductsCommand } from "@aws-sdk/client-pricing";

/**
 * The AWS Pricing API requires signed requests (AWS credentials).
 *
 * In this app we use the connected user's AWS credentials so we don't ship
 * any platform-level AWS keys in environment variables.
 *
 * Note: users may need `pricing:GetProducts` permission for accurate pricing.
 * If they don't have it, we return a graceful "Cost unavailable" string.
 */
export interface AwsApiCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}

function createPricingClient(credentials: AwsApiCredentials) {
  return new PricingClient({
    region: "us-east-1", // Pricing API is only available in us-east-1 and ap-south-1
    credentials,
  });
}

// Helper function to map human-readable region names to pricing API locations
const getRegionLocation = (region: string): string => {
  const regionMap: { [key: string]: string } = {
    "eu-north-1": "EU (Stockholm)",
    "us-east-1": "US East (N. Virginia)",
    // Add other regions as needed
  };
  return regionMap[region] || region;
};

export async function getEC2InstanceCost(
  instanceType: string,
  region: string,
  credentials: AwsApiCredentials
): Promise<string> {
  try {
    if (!credentials?.accessKeyId || !credentials?.secretAccessKey) return "Cost unavailable";

    const pricingClient = createPricingClient(credentials);
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
      // The AWS Pricing API returns a JSON string without a stable TS type.
      // We treat it as `any` and defensively parse what we need.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const priceData: any = JSON.parse(PriceList[0] as string);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const onDemandTerms: any = priceData?.terms?.OnDemand;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const priceDimension: any = onDemandTerms ? Object.values(onDemandTerms)[0] : undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firstPriceDim: any = priceDimension?.priceDimensions ? Object.values(priceDimension.priceDimensions)[0] : undefined;
      const hourlyUsd = firstPriceDim?.pricePerUnit?.USD;
      const hourlyPrice = hourlyUsd ? parseFloat(hourlyUsd) : NaN;
      if (!Number.isFinite(hourlyPrice)) return "Cost unavailable";
      
      // Calculate monthly cost (730 hours in a month on average)
      const monthlyCost = hourlyPrice * 730;
      return `$${monthlyCost.toFixed(2)}`;
    }
    return "Cost not found";
  } catch (error) {
    console.error(`Error fetching price for EC2 instance ${instanceType}:`, error);
    return "Cost unavailable";
  }
}

export async function getEBSVolumeCost(
  volumeType: string,
  sizeGb: number,
  region: string,
  credentials: AwsApiCredentials
): Promise<string> {
  try {
    if (!credentials?.accessKeyId || !credentials?.secretAccessKey) return "Cost unavailable";

    const pricingClient = createPricingClient(credentials);
    const command = new GetProductsCommand({
      ServiceCode: "AmazonEC2",
      Filters: [
        { Type: "TERM_MATCH", Field: "location", Value: getRegionLocation(region) },
        { Type: "TERM_MATCH", Field: "volumeApiName", Value: volumeType }, // e.g., gp3, gp2
      ],
    });

    const { PriceList } = await pricingClient.send(command);

    if (PriceList && PriceList.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const priceData: any = JSON.parse(PriceList[0] as string);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const onDemandTerms: any = priceData?.terms?.OnDemand;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const priceDimension: any = onDemandTerms ? Object.values(onDemandTerms)[0] : undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firstPriceDim: any = priceDimension?.priceDimensions ? Object.values(priceDimension.priceDimensions)[0] : undefined;
      const usd = firstPriceDim?.pricePerUnit?.USD;
      const pricePerGbMonth = usd ? parseFloat(usd) : NaN;
      if (!Number.isFinite(pricePerGbMonth)) return "Cost unavailable";

      const monthlyCost = pricePerGbMonth * sizeGb;
      return `$${monthlyCost.toFixed(2)}`;
    }
    return "Cost not found";
  } catch (error) {
    console.error(`Error fetching price for EBS volume ${volumeType}:`, error);
    return "Cost unavailable";
  }
}