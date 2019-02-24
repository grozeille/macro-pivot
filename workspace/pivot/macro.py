import xlwings as xw
import pandas as pd
import sys
import logging

def run_macro(file_path, src_sheet_name, src_table_start, dest_sheet_name, dest_table_start):
    wb = xw.Book(file_path)
    sht = wb.sheets[src_sheet_name]

    table_start_range = sht.range(src_table_start)
    table_start = (table_start_range.row, table_start_range.column)

    index_name = sht.range(table_start[0], table_start[1] + 1).value

    # get the size of the table
    value = '#'
    max_y = table_start[0]
    while value is not None:
        value = sht.range(max_y + 1, table_start[1]).value
        if value is not None:
            max_y += 1

    value = '#'
    max_x = table_start[1]
    while value is not None:
        value = sht.range(table_start[0], max_x + 1).value
        if value is not None:
            max_x += 1

    # get all values to retrieve the rows/columns
    column_list = []

    for y in range(table_start[0] + 1, max_y + 1):
        for x in range(table_start[1] + 1, max_x + 1):
            value = sht.range(y, x).value
            if value is not None:
                column_list.append(value)

    column_list = list(set(column_list))
    column_list.sort()

    row_list = []
    for y in range(table_start[0] + 1, max_y + 1):
        value = sht.range(y, table_start[1] + 1).value
        if value is not None:
            row_list.append(value)
    
    row_list = list(set(row_list))
    row_list.sort()
    
    # create a dictionary of all columns with all the rows
    column_rows_dic = {}
    column_rows_dic.update({index_name: row_list})
    for go in column_list:
        column_rows_list = [None] * len(row_list)
        column_rows_dic.update({go : column_rows_list})

    # scan the table to fill the rows
    for y in range(table_start[0] + 1, max_y + 1):
        column = sht.range(y, table_start[1] + 1).value
        row_value = sht.range(y, table_start[1]).value
        if column is None:
            continue
        for x in range(table_start[1] + 2, max_x + 1):
            value = sht.range(y, x).value
            if value is None:
                continue
            column_rows_list = column_rows_dic[value]
            index_column = row_list.index(column)
            if column_rows_list[index_column] is not None:
                column_rows_list[index_column] += '\n' + row_value
            else:
                column_rows_list[index_column] = row_value

    # build the dataframe and put into excel
    df = pd.DataFrame(column_rows_dic)
    df = df.set_index(index_name)
    print(df.to_string())

    wb.sheets[dest_sheet_name].range(dest_table_start).value = df

if __name__ == '__main__':
    file_path = sys.argv[1]
    #src_sheet_name = sys.argv[2]
    #src_table_start = sys.argv[3]
    #dest_sheet_name = sys.argv[4]
    #dest_table_start = sys.argv[5]
    src_sheet_name = "Sheet1"
    src_table_start = "B2"
    dest_sheet_name = "Sheet1"
    dest_table_start = "B14"

    run_macro(file_path, src_sheet_name, src_table_start, dest_sheet_name, dest_table_start)
