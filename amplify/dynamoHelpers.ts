// dynamoHelpers.ts
import {
  DynamoDBClient,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

const REGION = "us-east-1"; // or your region
const TABLE_NAME = "Delta-Cipher-Demo";

const ddbClient = new DynamoDBClient({ region: REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

/**
 * Finds the item with the largest PromptID in the table (or null if table is empty).
 */
export async function getLargestPromptItem() {
  // Using a Scan to get all items; then pick the largest PromptID in client code
  const data = await ddbDocClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );

  if (!data.Items || data.Items.length === 0) {
    return null;
  }

  // Find the item with the largest PromptID
  let maxItem = data.Items[0];
  for (const item of data.Items) {
    if ((item.PromptID || 0) > (maxItem.PromptID || 0)) {
      maxItem = item;
    }
  }
  return maxItem;
}

/**
 * Increments the PromptRewrites attribute of the item with largest PromptID by 1.
 */
export async function incrementPromptRewrites() {
  const largest = await getLargestPromptItem();
  if (!largest) return; // or handle no item scenario

  const { PromptID } = largest;
  const newRewriteVal = (largest.PromptRewrites || 0) + 1;

  await ddbDocClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PromptID },
      UpdateExpression: "SET PromptRewrites = :r",
      ExpressionAttributeValues: {
        ":r": newRewriteVal,
      },
    })
  );
}

/**
 * Creates a new item (PromptID = nextId, PromptRewrites = 0, PromptAttempts = [[-1, ""]]).
 * You must pass in the new PromptID value you want to use.
 */
export async function createNewPromptItem(promptId: number) {
  const putParams = {
    TableName: TABLE_NAME,
    Item: {
      PromptID: promptId,
      PromptRewrites: 0,
      PromptAttempts: [[-1, ""]],
    },
  };
  await ddbDocClient.send(new PutCommand(putParams));
}

/**
 * Updates the PromptAttempts for the item with largest PromptID:
 * - If PromptRewrites = 0, set PromptAttempts = [[0, inputText]].
 * - If PromptRewrites > 0, append [-1, inputText] to the existing PromptAttempts list.
 */
export async function updatePromptAttemptsOnSend(inputText: string) {
  const largest = await getLargestPromptItem();
  if (!largest) return;

  const { PromptID, PromptRewrites = 0, PromptAttempts = [] } = largest;

  if (PromptRewrites === 0) {
    // Replace the entire PromptAttempts with [[0, inputText]]
    await ddbDocClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PromptID },
        UpdateExpression: "SET PromptAttempts = :a",
        ExpressionAttributeValues: {
          ":a": [[-1, inputText]],
        },
      })
    );
  } else {
    // Append [-1, inputText] to existing PromptAttempts
    const newAttemptList = [...PromptAttempts, [-1, inputText]];
    await ddbDocClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PromptID },
        UpdateExpression: "SET PromptAttempts = :a",
        ExpressionAttributeValues: {
          ":a": newAttemptList,
        },
      })
    );
  }
}
