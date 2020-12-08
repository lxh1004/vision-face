<template>
  <div id="main">
    <Search @search="handleSearch" />
    <Pagination
      :pageSize="search.page_count"
      :total="total"
      :page="search.page_num"
      @page="handlePage"
    />
    <Table ref="table" :popover.sync="popover" @setTotal="handleSetTotal" @sort="handleSort" />
    <Pagination
      :pageSize="search.page_count"
      :total="total"
      :page="search.page_num"
      @page="handlePage"
    />
    <Popover :popover="popover" />
  </div>
</template>

<script>
import moment from "moment";

// components
import Search from "./search";
import Table from "./table";
import Pagination from "./pagination";
import Popover from "./popover";

export default {
  // global awareness
  name: "home",

  // templete dependencies
  components: {
    Search,
    Table,
    Pagination,
    Popover,
  },

  // local state
  data() {
    const now = moment();
    return {
      search: {
        page_num: 1,
        organization_id: null,
        page_count: 20,
        start_time: moment(now).startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        end_time: moment(now).endOf("day").format("YYYY-MM-DD HH:mm:ss"),
        confidence_min: 0,
        confidence_max: 1,
        audit: [],
        name: "",
        ip: "",
        rectify: "",
        is_atlas: false,
        violationReasons: [],
        isSmartCubeUnqualified: "",
      },
      total: 0,
      popover: null,
    };
  },

  // events
  watch: {
    search: {
      handler(newSearch) {
        sessionStorage.setItem("search", JSON.stringify(newSearch));
        this.$refs.table.search(newSearch);
      },
      deep: true,
    },
  },
  mounted() {
    let init = JSON.parse(sessionStorage.getItem("search"));
    if (init) {
      this.search = {
        page_num: init.page_num,
        page_count: 20,
        start_time: init.start_time,
        end_time: init.end_time,
        confidence_min: init.confidence_min,
        confidence_max: init.confidence_max,
        audit: init.audit,
        name: init.name,
        ip: init.ip,
        rectify: init.rectify,
        is_atlas: init.is_atlas,
        violationReasons: init.violationReasons,
      };
    } else {
      this.$refs.table.search(this.search);
    }
  },

  // non-reactive properties
  methods: {
    // handle search
    handleSearch({
      company,
      time,
      confidence,
      audit,
      name,
      ip,
      rectify,
      is_atlas,
      violationReasons,
      isSmartCubeUnqualified,
    }) {
      this.search = {
        page_num: 1,
        page_count: 20,
        organization_id: company,
        start_time: moment(time[0]).format("YYYY-MM-DD HH:mm:ss"),
        end_time: moment(time[1]).format("YYYY-MM-DD HH:mm:ss"),
        confidence_min: confidence[0],
        confidence_max: confidence[1],
        audit,
        name,
        ip,
        rectify,
        is_atlas,
        violationReasons,
        isSmartCubeUnqualified,
      };
    },

    // handle set total
    handleSetTotal(total) {
      this.total = total;
    },

    // handle sort
    handleSort() {
      this.$refs.table.search(this.search);
    },

    // handle set current page
    handlePage(page) {
      this.search.page_num = page;
    },
  },
};
</script>

<style lang="scss">
</style>
