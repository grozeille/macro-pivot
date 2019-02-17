import xlwings as xw
import pandas as pd
import sys

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

    # get all values
    column_list = []
    cpt_x = table_start[1] + 1
    cpt_y = table_start[0] + 1

    for y in range(table_start[0] + 1, max_y + 1):
        for x in range(table_start[1] + 1, max_x + 1):
            value = sht.range(y, x).value
            if value is not None:
                column_list.append(value)

    column_list = list(set(column_list))
    column_list.sort()
    
    # create a dictionary of all columns with all the rows
    column_rows_dic = {}
    column_rows_dic.update({index_name: column_list})
    for go in column_list:
        rows_list = [None] * len(column_list)
        column_rows_dic.update({go : rows_list})

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
            rows_list = column_rows_dic[value]
            index_column = column_list.index(column)
            rows_list[index_column] = row_value

    # build the dataframe and put into excel
    df = pd.DataFrame(column_rows_dic)
    df = df.set_index(index_name)
    print(df)

    wb.sheets[dest_sheet_name].range(dest_table_start).value = df

if __name__ == '__main__':

    #file_path = r'test.xlsx'
    #src_sheet_name = 'Sheet1'
    #src_table_start = 'D7'
    #dest_sheet_name = 'Sheet1'
    #dest_table_start = 'O16'

    file_path = sys.argv[1]
    src_sheet_name = sys.argv[2]
    src_table_start = sys.argv[3]
    dest_sheet_name = sys.argv[4]
    dest_table_start = sys.argv[5]

    run_macro(file_path, src_sheet_name, src_table_start, dest_sheet_name, dest_table_start)
