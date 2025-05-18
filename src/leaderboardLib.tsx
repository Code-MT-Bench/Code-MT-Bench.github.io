import styles from "./Leaderboard.module.css"

function mean(array: Array<number>) {
  return array.reduce((a, b) => a + b, 0) / array.length
}

function formatNumber(number: number) {
  return Number(number.toFixed(1))
}

function formatAsPercentage(number: number) {
  // Convert decimal to percentage with 1 decimal place and add % sign
  return `${(number * 100).toFixed(1)}%`
}

function get_pass_at_1(
  results_df: Array<any>,
  model: string,
  start: number,
  end: number
) {
  // model and date filter
  /*
  const results = results_df.filter(
    (result) =>
      result["model"] === model &&
      result["date"] >= start &&
      result["date"] <= end
  )
  */
  const results = results_df.filter(
    (result) =>
      result["model"] === model
  )
  const dictionary: { [key: string]: any } = {};

  if (results.length > 0 && results[0] !== null) {
    Object.keys(results[0]).forEach(key => {
      dictionary[key] = parseFloat(mean(results.map((result) => result[key])).toFixed(3));
    });
  }else{
    console.log(`${model}: 不存在`);
  }

  return {
    dictionary
  }
}

function getLeaderboard(
  performances: Array<any>,
  models: Array<any>,
  start: number,
  end: number
) {
  return models
    //.filter((model) => model.release_date)
    .map((model) => {
      const { dictionary } = get_pass_at_1(
        performances,
        model.model_name,
        0,
        0
      )
      let output: { [key: string]: any } = {}
      output["Model"] = model.model_name
      //output["Estimated Cutoff For LiveCodeBench"] = "Estimated Cutoff For LiveCodeBench: " + new Date(model.release_date).toLocaleDateString()
      output["Contaminated"] = false

      // Get the size from the performance data directly instead of from dictionary
      const modelPerformance = performances.find(p => p.model === model.model_name);
      if (modelPerformance && modelPerformance.size) {
        output["size"] = modelPerformance.size;  // Use the original size value, not the averaged one
      } else {
        output["size"] = "N/A";  // Provide a default value if size is not available
      }
 
      Object.keys(dictionary).forEach(key => {
        if (key !== "model" && key !== "date" && key !== "size"){
          output[key] = dictionary[key]
        }
      });
      return output
    })
    .sort((a, b) => b["AVG"] - a["AVG"])
    .reduce(
      (
        acc: {
          results: Array<typeof model & { Rank: number | null }>
          rank: number
        },
        model
      ) => {
        let rank = null
        rank = acc.rank
        if (acc.results.length>0 && model.AVG !== acc.results[acc.results.length - 1].AVG){
          acc.rank += 1
          rank = acc.rank
        }
        
        // Add medal emojis to top 3 ranked models
        if (rank === 1) {
          model.Model = `🥇 ${model.Model}`;
        } else if (rank === 2) {
          model.Model = `🥈 ${model.Model}`;
        } else if (rank === 3) {
          model.Model = `🥉 ${model.Model}`;
        }
        
        acc.results.push({
          Rank: rank,
          ...model,
        })
        return acc
      },
      { results: [], rank: 1 }
    ).results
}

function getDateMarksFromModels(models: Array<any>) {
  const modelDates = models
    .filter((model) => model.release_date)
    .map((model) => model.release_date)

  const uniqueDates = [
    // @ts-ignore
    ...new Set(modelDates),
    new Date("2024-01-01").getTime(),
  ]

  return uniqueDates
    .map((date) => ({
      value: date,
      label: new Date(date).toLocaleDateString(undefined, {
        timeZone: "UTC",
      }),
    }))
    .sort((a, b) => a.value - b.value)
}

function getDateMarksFromTimestamps(timestamps: Array<number>) {
  return timestamps.map((timestamp) => ({
    value: timestamp,
    label: new Date(timestamp).toLocaleDateString(undefined, {
      timeZone: "UTC",
    }),
  }))
}

function getColumnDefs(columnNames: Array<string>, modelsDict: any, page_idx : string, highlightedColumn: string | null = null) {
  // Define typescript interface for column definition
  interface ColumnDef {
    field?: string;
    headerName?: string;
    suppressMovable?: boolean;
    cellClass?: string | ((params: any) => string | string[]);
    flex?: number;
    pinned?: string;
    tooltipField?: string;
    minWidth?: number;
    children?: ColumnDef[];
    valueFormatter?: (params: any) => string;
    type?: string;
  }

  // All columns without grouping
  const allColumns: ColumnDef[] = [];
  
  // Add Model column first
  const modelColumn = {
    field: "Model",
    headerName: "Model",
    suppressMovable: true,
    cellClass: 'suppress-movable-col',
    flex: 2,
    pinned: "left",
    tooltipField: "Estimated Cutoff For LiveCodeBench",
  };
  allColumns.push(modelColumn);
  
  // Add Size column after Model with special formatting
  allColumns.push({
    headerName: "Size",
    field: "size",
    suppressMovable: true,
    cellClass: 'suppress-movable-col',
    minWidth: 80,
    type: 'textColumn',
    valueFormatter: (params) => {
      // Return the emoji or text value directly if it exists, or 'N/A' if it doesn't
      return params.value || 'N/A';
    }
  });
  
  // Add Rank, Avg columns
  allColumns.push({
    headerName: "Rank",
    field: "Rank",
    suppressMovable: true,
    cellClass: 'suppress-movable-col',
    minWidth: 70,
  });
  
  allColumns.push({
    headerName: "Avg",
    field: "AVG",
    minWidth: 70,
  });
  
  // If we have a highlighted column, add it directly after AVG
  if (highlightedColumn) {
    const column = columnNames.find(column_name => column_name === highlightedColumn);
    if (column && column !== "Model" && column !== "Rank" && column !== "AVG" && column !== "size" && column !== "Estimated Cutoff For LiveCodeBench" && column !== "Contaminated") {
      let mwidth = 75;
      if (column.length > 4) {
        mwidth = 95;
      } else if (column.length < 3) {
        mwidth = 70;
      }
      if (column === "Scheme" || column === "VimL" || column === "Ruby") {
        mwidth = 105;
      }
      
      allColumns.push({
        field: column,
        headerName: column,
        minWidth: mwidth,
        cellClass: 'highlighted-column'
      });
    }
  }
  
  // Add remaining columns (excluding the one that is already highlighted)
  columnNames
    .filter(column_name => 
      column_name !== "Model" && 
      column_name !== "Rank" && 
      column_name !== "AVG" && 
      column_name !== "size" &&
      column_name !== "Estimated Cutoff For LiveCodeBench" && 
      column_name !== "Contaminated" &&
      column_name !== highlightedColumn)
    .forEach(column_name => {
      let mwidth = 75;
      if (column_name.length > 4) {
        mwidth = 95;
      } else if (column_name.length < 3) {
        mwidth = 70;
      }
      if (column_name === "Scheme" || column_name === "VimL" || column_name === "Ruby") {
        mwidth = 105;
      }
      allColumns.push({
        field: column_name,
        headerName: column_name,
        minWidth: mwidth,
      });
    });

  return allColumns as any; // Type assertion to maintain compatibility with existing code
}

export { getDateMarksFromTimestamps, getLeaderboard, getColumnDefs }
